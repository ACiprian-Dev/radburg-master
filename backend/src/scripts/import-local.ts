/* --------------------------------------------------------------------
   import-local.ts  •  July-2025  •  fast & dup-safe
   Streams a JSON ARRAY file (≈33 k objects) into PostgreSQL.

   Optimisations
     • one tx per 2 000-row batch (no per-row tx)
     • de-dupe offers & product_tag inside each batch
------------------------------------------------------------------- */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from "fs";

import pgpFactory from "pg-promise";
import slugify from "slugify";

/* ───── CONFIG ─────────────────────────────────────────── */
const FILE_PATH = "./data.json";
const SELLER_ID = 1; // RADBURG
const BATCH_SIZE = 2_000; // rows per flush

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
  tag: new Map(),
};

/* ───── HELPERS ────────────────────────────────────────── */
const safe = (v: any, fb = "UNKNOWN") =>
  typeof v === "string" && v.trim() !== "" ? v.trim() : fb;
const slugOf = (txt: string) => slugify(txt, { lower: true, strict: true });
const makeSlug = (
  brand: string,
  model: string,
  size: string,
  typ: string,
  bucket: string | null,
  dot: string | null,
) =>
  slugify(
    [brand, model, size, typ.toLowerCase(), bucket ? `${bucket}mm` : null, dot]
      .filter(Boolean)
      .join(" "),
    { lower: true, trim: true },
  );

/* ─── generic upsert-or-get helper (NULL-safe) ─────────── */
async function idFor(
  table: keyof CacheMap,
  cols: Record<string, any>,
  t: pgpFactory.ITask<any>,
): Promise<number> {
  const key =
    table === "tag"
      ? (cols.slug as string).toLowerCase()
      : Object.values(cols).join("|").toLowerCase();
  if (cache[table].has(key)) return cache[table].get(key)!;

  /* tag: conflict handled on slug ----------------------- */
  if (table === "tag") {
    const { value, slug } = cols;
    const row = await t.one(
      `INSERT INTO tag (value, slug)
         VALUES ($1,$2)
         ON CONFLICT (slug) DO UPDATE SET value = EXCLUDED.value
         RETURNING id`,
      [value, slug],
    );
    cache[table].set(key, row.id);
    return row.id;
  }

  /* generic branch -------------------------------------- */
  const names = Object.keys(cols);
  const vals = Object.values(cols);
  const pl = names.map((_, i) => `$${i + 1}`).join(",");

  let row = await t.oneOrNone(
    `INSERT INTO ${table}(${names.join(",")})
       VALUES (${pl})
       ON CONFLICT DO NOTHING
       RETURNING id`,
    vals,
  );
  if (!row) {
    const cond = names
      .map((c, i) => `${c} IS NOT DISTINCT FROM $${i + 1}`)
      .join(" AND ");
    row = await t.oneOrNone(`SELECT id FROM ${table} WHERE ${cond}`, vals);
  }
  if (!row) {
    row = await t.one(
      `INSERT INTO ${table}(${names.join(",")}) VALUES (${pl}) RETURNING id`,
      vals,
    );
  }
  cache[table].set(key, row.id);
  return row.id;
}

/* ───── COLUMN SETS ────────────────────────────────────── */
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
const csPT = new pgp.helpers.ColumnSet(["product_id", "tag_id"], {
  table: "product_tag",
});

/* ───── MAIN ───────────────────────────────────────────── */
async function main() {
  const WINDOW_MM = Number(
    (
      await db.oneOrNone(
        "SELECT val FROM sys_setting WHERE key='sh_depth_window_mm'",
      )
    )?.val ?? 2,
  );
  const bucketOf = (d: number) => Math.floor(d / WINDOW_MM);

  const data = JSON.parse(fs.readFileSync(FILE_PATH, "utf8")) as any[];
  console.log(`Loaded ${data.length} objects from file`);

  const rawRows: any[] = [];
  const srcRows: any[] = [];
  let processed = 0,
    skipped = 0;

  for (const r of data) {
    const brandName = safe(r.Marca);
    const modelName = safe(r.Model);
    if (brandName === "UNKNOWN" || modelName === "UNKNOWN") {
      skipped++;
      continue;
    }

    rawRows.push({ payload: r, source: "MP" });
    srcRows.push(r);
    processed++;

    if (rawRows.length >= BATCH_SIZE) {
      await flush(rawRows, srcRows, bucketOf);
      console.log(`Processed ${processed} items…`);
    }
  }

  if (rawRows.length) await flush(rawRows, srcRows, bucketOf);

  console.log(`✓ Import finished • total=${processed} • skipped=${skipped}`);
  pgp.end();
}

/* ───── batch flush ───────────────────────────────────── */
async function flush(raw: any[], src: any[], bucketOf: (d: number) => number) {
  await db.tx(async (t) => {
    /* 1. dump raw JSON ------------------------------------------------ */
    await t.none(pgp.helpers.insert(raw, csRaw) + " ON CONFLICT DO NOTHING");

    /* 2. transform rows → build arrays -------------------------------- */
    const offers: any[] = [];
    const offTy: any[] = [];
    const pTags: any[] = [];

    for (const r of src) {
      const brandId = await idFor("brand", { name: safe(r.Marca) }, t);
      const modelId = await idFor(
        "model",
        { brand_id: brandId, name: safe(r.Model) },
        t,
      );
      const dimId = await idFor(
        "dimension",
        {
          width_mm: Number(r.Latime) || null,
          height_pct: Number(r.Inaltime) || null,
          rim_diam_in: Number(r.Diametru),
        },
        t,
      );
      const seasonId = await idFor("season", { name: safe(r.Sezon, "ALL") }, t);

      const typ = r.TipProdus.includes("SH")
        ? "SH"
        : r.TipProdus.toLowerCase().includes("eco")
          ? "ECO"
          : "NEW";
      const depth = Number(r.mmProfil) || null;
      const buck = typ === "SH" && depth !== null ? bucketOf(depth) : null;
      const slug = makeSlug(
        safe(r.Marca),
        safe(r.Model),
        safe(r.Dimensiune),
        typ,
        buck?.toString() ?? null,
        r.DOT,
      );
      const title = safe(
        r.Titlu ?? r.titlu,
        `${safe(r.Marca)} ${safe(r.Model)} ${safe(r.Dimensiune)}`,
      );

      const { id: productId } = await t.one(
        `INSERT INTO product
           (product_type,brand_id,model_id,slug,title)
         VALUES ('TYRE',$1,$2,$3,$4)
         ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
         RETURNING id`,
        [brandId, modelId, slug, title],
      );

      await t.none(
        `INSERT INTO product_tyres
           (product_id,dimension_id,season_id,dot_year,
            load_index,speed_index,depth_bucket)
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

      offers.push({
        product_id: productId,
        seller_id: SELLER_ID,
        sku_external: String(r.SKU),
        price_numeric: Number(r.Pret_Lista) || 0,
        stock: Number(r.stoc) || 0,
        is_active: true,
        lead_time_days: null,
        currency: "RON",
      });
      offTy.push({
        offer_id: null,
        min_depth_mm: depth,
        quality_grade: r.Calitate,
      });

      if (r.Etichete) {
        for (const rawTag of r.Etichete.split(",")) {
          const tagVal = safe(rawTag)
            .replace(/^Anvelope\s+/i, "")
            .trim();
          if (!tagVal) continue;
          const tagId = await idFor(
            "tag",
            { value: tagVal, slug: slugOf(tagVal) },
            t,
          );
          pTags.push({ product_id: productId, tag_id: tagId });
        }
      }
    }

    /* 3. de-duplicate offers inside batch ----------------------------- */
    const mapOff = new Map<string, { offer: any; offTy: any }>();
    offers.forEach((o, i) => {
      const k = `${o.seller_id}|${o.sku_external}|${o.product_id}`;
      mapOff.set(k, { offer: o, offTy: offTy[i] }); // last wins
    });
    const dedupOffers = Array.from(mapOff.values(), (v) => v.offer);
    const dedupOffTy = Array.from(mapOff.values(), (v) => v.offTy);

    /* 4. insert offers & link offer_tyres ----------------------------- */
    const inserted = await t.any(
      pgp.helpers.insert(dedupOffers, csOff) +
        `
        ON CONFLICT (seller_id,sku_external,product_id)
        DO UPDATE SET price_numeric = EXCLUDED.price_numeric,
                      stock         = EXCLUDED.stock,
                      updated_at    = now()
        RETURNING id`,
    );
    inserted.forEach((row, i) => (dedupOffTy[i].offer_id = row.id));

    await t.none(
      pgp.helpers.insert(dedupOffTy, csOffTy) +
        `
        ON CONFLICT (offer_id)
        DO UPDATE SET min_depth_mm = EXCLUDED.min_depth_mm`,
    );

    /* 5. de-duplicate product_tag and insert -------------------------- */
    const setPT = new Set<string>();
    const dedupPT: any[] = [];
    for (const pt of pTags) {
      const key = `${pt.product_id}|${pt.tag_id}`;
      if (setPT.has(key)) continue;
      setPT.add(key);
      dedupPT.push(pt);
    }
    if (dedupPT.length) {
      await t.none(
        pgp.helpers.insert(dedupPT, csPT) + " ON CONFLICT DO NOTHING",
      );
    }
  });

  /* clear arrays for next batch */
  raw.length = src.length = 0;
}

/* ───── RUN ─────────────────────────────────────────────── */
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
