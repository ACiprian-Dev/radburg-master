/* eslint-disable @typescript-eslint/no-explicit-any */
/* --------------------------------------------------------------------
   import-local.ts  •  July-2025 stable
   Streams a JSON ARRAY file (≈33 k objects) into PostgreSQL
   ------------------------------------------------------------------ */

import * as fs from "fs";

import pgpFactory from "pg-promise";
import slugify from "slugify";

/* ───── CONFIG ─────────────────────────────────────────── */
const FILE_PATH = "./data/feed-tyres.json"; // JSON array
const SELLER_ID = 1; // RADBURG
const BATCH_SIZE = 500;

/* ───── PG INIT ────────────────────────────────────────── */
const pgp = pgpFactory({ capSQL: true });
const db = pgp(
  process.env.DATABASE_URL ?? "postgres://tyres:tyres@localhost:5432/tyres",
);

/* ───── IN-MEMORY LOOKUP CACHE ─────────────────────────── */
type CacheMap = Record<string, Map<string, number>>;
const cache: CacheMap = {
  brand: new Map(),
  model: new Map(),
  dimension: new Map(),
  season: new Map(),
};

/* ─── replace old idFor with this version ───────────────────────── */
async function idFor(
  table: keyof CacheMap,
  cols: Record<string, any>,
  t: pgpFactory.ITask<any>,
): Promise<number> {
  const key = Object.values(cols).join("|").toLowerCase();
  if (cache[table].has(key)) return cache[table].get(key)!;

  const names = Object.keys(cols);
  const vals = Object.values(cols);
  const pl = names.map((_, i) => `$${i + 1}`).join(",");

  /* 1️⃣ try insert-or-nothing */
  let row = await t.oneOrNone(
    `INSERT INTO ${table}(${names.join(",")})
       VALUES (${pl})
       ON CONFLICT DO NOTHING
       RETURNING id`,
    vals,
  );

  /* 2️⃣ if nothing came back, try select */
  if (!row) {
    row = await t.oneOrNone(
      `SELECT id FROM ${table}
         WHERE ${names.map((c, i) => `${c}=$${i + 1}`).join(" AND ")}`,
      vals,
    );
  }

  /* 3️⃣ if still null, force an insert that MUST succeed */
  if (!row) {
    row = await t.one(
      `INSERT INTO ${table}(${names.join(",")}) VALUES (${pl}) RETURNING id`,
      vals,
    );
  }

  cache[table].set(key, row.id);
  return row.id;
}

/* ───── HELPERS ────────────────────────────────────────── */
function safe(v: any, fallback = "UNKNOWN"): string {
  return typeof v === "string" && v.trim() !== "" ? v.trim() : fallback;
}
function makeSlug(
  brand: string,
  model: string,
  size: string,
  typ: string,
  bucket: string | null,
  dot: string | null,
) {
  return slugify(
    [brand, model, size, typ.toLowerCase(), bucket ? `${bucket}mm` : null, dot]
      .filter(Boolean)
      .join(" "),
    { lower: true, trim: true },
  );
}

/* ───── COLUMN SETS for bulk-insert ────────────────────── */
const csRaw = new pgp.helpers.ColumnSet(["payload", "source"], {
  table: "product_raw",
});
const csOff = new pgp.helpers.ColumnSet(
  [
    "product_id",
    "seller_id",
    "sku_external",
    "price_numeric",
    "stock",
    "is_active",
    "lead_time_days",
    "currency",
  ],
  { table: "offer" },
);
const csOffTy = new pgp.helpers.ColumnSet(
  ["offer_id", "min_depth_mm", "quality_grade"],
  { table: "offer_tyres" },
);

/* ───── MAIN ───────────────────────────────────────────── */
async function main() {
  const WINDOW_MM = Number(
    (await db.one("SELECT val FROM sys_setting WHERE key='sh_depth_window_mm'"))
      .val,
  );
  const bucketOf = (d: number) => Math.floor(d / WINDOW_MM);

  const data = JSON.parse(fs.readFileSync(FILE_PATH, "utf8")) as any[];
  console.log(`Loaded ${data.length} objects from file`);

  const rawRows: any[] = [];
  const offers: any[] = [];
  const offersTy: any[] = [];
  let skipped = 0;

  for (const r of data) {
    const brandName = safe(r.Marca);
    const modelName = safe(r.Model);

    /* skip rows missing brand OR model */
    if (brandName === "UNKNOWN" || modelName === "UNKNOWN") {
      skipped++;
      continue;
    }

    rawRows.push({ payload: r, source: "MP" });

    await db.tx(async (t) => {
      /* look-ups */
      const brandId = await idFor("brand", { name: brandName }, t);
      const modelId = await idFor(
        "model",
        { brand_id: brandId, name: modelName },
        t,
      );
      const dimId = await idFor(
        "dimension",
        {
          width_mm: Number(r.Latime) || null,
          height_pct: r.Inaltime ? Number(r.Inaltime) : null,
          rim_diam_in: Number(r.Diametru),
        },
        t,
      );
      const seasonId = await idFor("season", { name: safe(r.Sezon, "ALL") }, t);

      /* derive */
      const typ = r.TipProdus.includes("SH")
        ? "SH"
        : r.TipProdus.toLowerCase().includes("eco")
          ? "ECO"
          : "NEW";
      const depth = Number(r.mmProfil) || null;
      const buck = typ === "SH" && depth !== null ? bucketOf(depth) : null;
      const slug = makeSlug(
        brandName,
        modelName,
        safe(r.Dimensiune),
        typ,
        buck?.toString() ?? null,
        r.DOT,
      );

      /* product */
      const { id: productId } = await t.one(
        `INSERT INTO product (product_type, brand_id, model_id, slug)
         VALUES ('TYRE',$1,$2,$3)
         ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug
         RETURNING id`,
        [brandId, modelId, slug],
      );

      await t.none(
        `INSERT INTO product_tyres
           (product_id, dimension_id, season_id, dot_year,
            load_index, speed_index, depth_bucket)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (product_id) DO NOTHING`,
        [
          productId,
          dimId,
          seasonId,
          Number(r.DOT) || null,
          Number(r.IndiceIncarcare) || null,
          r.IndiceViteza,
          buck,
        ],
      );

      /* offer arrays */
      offers.push({
        product_id: productId,
        seller_id: SELLER_ID,
        sku_external: String(r.SKU),
        price_numeric: Number(r.Pret_Lista),
        stock: Number(r.stoc) || 0,
        is_active: true,
        lead_time_days: null,
        currency: "RON",
      });
      offersTy.push({
        offer_id: null,
        min_depth_mm: depth,
        quality_grade: r.Calitate,
      });
    });

    if (rawRows.length >= BATCH_SIZE) await flush(rawRows, offers, offersTy);
  }

  await flush(rawRows, offers, offersTy);
  console.log(`✓ Import finished  •  skipped=${skipped}`);
  pgp.end();
}

/* ───── batch flush helper ─────────────────────────────── */
async function flush(raw: any[], off: any[], offTy: any[]) {
  if (!raw.length) return;

  /* -- dedup per (seller, sku, product) while keeping arrays aligned -- */
  const map = new Map<string, { offer: any; offerTy: any }>();
  for (let i = 0; i < off.length; i++) {
    const key = `${off[i].seller_id}|${off[i].sku_external}|${off[i].product_id}`;
    map.set(key, { offer: off[i], offerTy: offTy[i] }); // last row wins
  }
  const offDedup = Array.from(map.values(), (v) => v.offer);
  const offTyDedup = Array.from(map.values(), (v) => v.offerTy);

  await db.tx(async (t) => {
    await t.none(pgp.helpers.insert(raw, csRaw) + " ON CONFLICT DO NOTHING");

    const inserted = await t.any(
      pgp.helpers.insert(offDedup, csOff) +
        `
        ON CONFLICT (seller_id, sku_external, product_id)
        DO UPDATE SET
             price_numeric = EXCLUDED.price_numeric,
             stock         = EXCLUDED.stock,
             updated_at    = now()
        RETURNING id`,
    );

    inserted.forEach((row, i) => {
      offTyDedup[i].offer_id = row.id;
    });

    await t.none(
      pgp.helpers.insert(offTyDedup, csOffTy) +
        `
        ON CONFLICT (offer_id)
        DO UPDATE SET min_depth_mm = EXCLUDED.min_depth_mm`,
    );
  });

  raw.length = off.length = offTy.length = 0; // clear batch arrays
}

/* ───── RUN ─────────────────────────────────────────────── */
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
