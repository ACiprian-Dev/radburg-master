/* eslint-disable @typescript-eslint/no-explicit-any */
/* ------------------------------------------------------------------
   import-local.ts • July-2025 • readable names edition
------------------------------------------------------------------ */
import fs from "fs";

import pgpFactory from "pg-promise";
import slugify from "slugify";

const FEED_FILE = "./data.json";
const SELLER_ID = 1;
const BATCH_SIZE = 2_000;

const pgp = pgpFactory({ capSQL: true });
const db = pgp(
  process.env.DATABASE_URL ?? "postgres://tyres:tyres@localhost:5432/tyres",
);

/* ───── pre-compiled SQL fragments ───────────────────────────── */
const SQL = {
  insertProduct: `
    INSERT INTO product (product_type,brand_id,model_id,slug,title)
    VALUES ('TYRE',$1,$2,$3,$4)
    ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
    RETURNING id`,
  insertTyre: `
    INSERT INTO product_tyres
      (product_id,dimension_id,season_id,dot_year,load_index,speed_index,
       depth_bucket,tyre_type,usage_destination,km_garantee,tread_percentage_remaining,
       budget_bucket,tread_depth_mm,quality_rgba)
    VALUES ($/product_id/,$/dimension_id/,$/season_id/,$/dot_year/,$/load_index/,
            $/speed_index/,$/depth_bucket/,$/tyre_type/,$/usage_destination/,$/km_garantee/,$/tread_percentage_remaining/,$/budget_bucket/,
            $/tread_depth_mm/,$/quality_rgba/)
    ON CONFLICT (product_id) DO NOTHING`,
  insertCopy: `
    INSERT INTO product_copy
      (product_id,hero_json,pricing_json,photo_json,description_json,overlay_s,
       overlay_l,legacy_slug)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    ON CONFLICT (product_id) DO NOTHING`,
};

/* ───── helpers ─────────────────────────────────────────────── */
const textOrFallback = (val: any, fallback = "UNKNOWN") =>
  typeof val === "string" && val.trim() ? val.trim() : fallback;

const makeSlug = (text: string) => slugify(text, { lower: true, strict: true });

const makeProductSlug = (
  brand: string,
  model: string,
  size: string,
  tyreType: string,
  depthBucket: string | null,
  dot: string | null,
) =>
  slugify(
    [
      brand,
      model,
      size,
      tyreType.toLowerCase(),
      depthBucket ? `${depthBucket}mm` : null,
      dot,
    ]
      .filter(Boolean)
      .join(" "),
    { lower: true, trim: true },
  );

/* in-memory cache for lookup IDs */
type CacheMap = Record<string, Map<string, number>>;
const idCache: CacheMap = {
  brand: new Map(),
  model: new Map(),
  dimension: new Map(),
  season: new Map(),
  tag: new Map(),
};

/** Upsert a lookup row and return its ID (slug-aware) */
async function lookupId(
  entity: keyof CacheMap,
  cols: Record<string, any>,
  tx: pgpFactory.ITask<any>,
): Promise<number> {
  const cacheKey = (
    "slug" in cols ? cols.slug : Object.values(cols).join("|")
  ).toLowerCase();
  if (idCache[entity].has(cacheKey)) return idCache[entity].get(cacheKey)!;

  const colNames = Object.keys(cols);
  const values = Object.values(cols);

  const sql = `
    INSERT INTO ${entity}(${colNames.join(",")})
    VALUES (${colNames.map((_, i) => "$" + (i + 1)).join(",")})
    ON CONFLICT (${"slug" in cols ? "slug" : colNames.join(",")})
    DO UPDATE SET ${colNames
      .filter((n) => n !== "slug")
      .map((n) => `${n}=EXCLUDED.${n}`)
      .join(",")}
    RETURNING id`;

  const { id } = await tx.one(sql, values);
  idCache[entity].set(cacheKey, id);
  return id;
}

/* ───── ColumnSets for massive inserts ─────────────────── */
const csRaw = new pgp.helpers.ColumnSet(["payload", "source"], {
  table: "product_raw",
});
const csOffer = new pgp.helpers.ColumnSet(
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
const csOfferTy = new pgp.helpers.ColumnSet(
  ["offer_id", "min_depth_mm", "quality_grade"],
  { table: "offer_tyres" },
);
const csProdTag = new pgp.helpers.ColumnSet(["product_id", "tag_id"], {
  table: "product_tag",
});

/* ───── main flow ───────────────────────────────────────── */
async function main() {
  const feed = JSON.parse(fs.readFileSync(FEED_FILE, "utf8"));
  console.info(`loaded ${feed.length} feed rows`);

  const depthWindowMm = Number(
    (
      await db.oneOrNone(
        "SELECT val FROM sys_setting WHERE key='sh_depth_window_mm'",
      )
    )?.val ?? 2,
  );
  const depthBucketOf = (mm: number | null) =>
    mm === null ? null : Math.floor(mm / depthWindowMm);

  let batch: any[] = [];

  for (const feedRow of feed) {
    batch.push(feedRow);
    if (batch.length === BATCH_SIZE) {
      await flush(batch, depthBucketOf);
      batch = [];
    }
  }
  if (batch.length) await flush(batch, depthBucketOf);

  console.info("✓ import complete");
  pgp.end();
}

/* ───── flush one batch (single transaction) ────────────── */
async function flush(
  feedRows: any[],
  depthBucketOf: (n: number | null) => number | null,
) {
  await db.tx(async (tx) => {
    /* 1 ▸ raw audit dump */
    const rawRows = feedRows.map((row) => ({ payload: row, source: "MP" }));
    await tx.none(
      pgp.helpers.insert(rawRows, csRaw) + " ON CONFLICT DO NOTHING",
    );

    /* containers for bulk-insert */
    const offerRows: any[] = [];
    const offerTyRows: any[] = [];
    const productTags: any[] = [];
    let skippedBadDim = 0;
    for (const row of feedRows) {
      /* 1. look-ups */
      const brandName = textOrFallback(row.Marca);
      const brandId = await lookupId(
        "brand",
        { name: brandName, slug: makeSlug(brandName) },
        tx,
      );

      const modelName = textOrFallback(row.Model);
      const modelSlug = makeSlug(`${brandName}-${modelName}`);
      const modelId = await lookupId(
        "model",
        { brand_id: brandId, name: modelName, slug: modelSlug },
        tx,
      );

      const seasonName = textOrFallback(row.Sezon, "ALL");
      const seasonId = await lookupId(
        "season",
        { name: seasonName, slug: makeSlug(seasonName) },
        tx,
      );

      function parseNumber(v: any): number | null {
        const n = Number(v);
        return isFinite(n) && n > 0 ? n : null;
      }

      const widthMm = parseNumber(row.Latime);
      const heightPct = parseNumber(row.Inaltime);
      const rimDiamIn = parseNumber(row.Diametru);

      if (widthMm === null || rimDiamIn === null) {
        skippedBadDim++; // increment a counter so you see how many you drop
        continue; // skip this feed row altogether
      }
      const dimSlug = makeSlug(
        `${widthMm}${heightPct ? "-" + heightPct : ""}-r${rimDiamIn}`,
      );
      const dimensionId = await lookupId(
        "dimension",
        {
          width_mm: widthMm,
          height_pct: heightPct,
          rim_diam_in: rimDiamIn,
          slug: dimSlug,
        },
        tx,
      );

      /* 2. product row */
      const depthMm = Number(row.mmProfil) || null;
      const depthBucket =
        row.TipProdus.includes("SH") && depthMm !== null
          ? depthBucketOf(depthMm)
          : null;
      const productSlug = makeProductSlug(
        brandName,
        modelName,
        row.Dimensiune,
        row.TipProdus,
        depthBucket?.toString() || null,
        row.DOT,
      );
      const productTitle = textOrFallback(
        row.Titlu,
        `${brandName} ${modelName} ${row.Dimensiune}`,
      );

      const { id: productId } = await tx.one(SQL.insertProduct, [
        brandId,
        modelId,
        productSlug,
        productTitle,
      ]);

      /* 3. tyres spec row */
      const tyreType = row.TipProdus.toUpperCase().includes("SH")
        ? "SH"
        : row.TipProdus.toUpperCase().includes("RECONSTR")
          ? "REMOULD"
          : row.TipProdus.toUpperCase().includes("RESAP")
            ? "RETREAD"
            : "NEW";

      await tx.none(SQL.insertTyre, {
        product_id: productId,
        dimension_id: dimensionId,
        season_id: seasonId,
        dot_year: Number(row.DOT) || null,
        load_index: Number(row.IndiceIncarcare) || null,
        speed_index: row.IndiceViteza,
        depth_bucket: depthBucket,
        tyre_type: tyreType,
        usage_destination: row.Destinatie,
        km_garantee: Number(row.KmDeParcurs) || null,
        tread_percentage_remaining: row.ProfilRamas
          ? parseInt(String(row.ProfilRamas).replace("%", ""))
          : null,
        budget_bucket: row.tip_buget,
        tread_depth_mm: row.mmProfil || null,
        quality_rgba: row.rgb_calitate,
      });

      /* 4. product-copy blob */
      if (row.descriere_json) {
        await tx.none(SQL.insertCopy, [
          productId,
          row.ExplicatiiProdusPrincipal
            ? JSON.parse(row.ExplicatiiProdusPrincipal)[0]
            : null,
          row.explicatii_detalii_produs_pret
            ? JSON.parse(row.explicatii_detalii_produs_pret)[0][0]
            : null,
          row.explicatii_detalii_produs_foto
            ? JSON.parse(row.explicatii_detalii_produs_foto)[0][0]
            : null,
          JSON.parse(row.descriere_json),
          row.text_imagine_foto_mic
            ? JSON.parse(row.text_imagine_foto_mic)[0][0]
            : null,
          row.text_imagine_foto_mare
            ? JSON.parse(row.text_imagine_foto_mare)[0][0]
            : null,
          row.LinkSiteVechi,
        ]);
      }

      /* 5. stage offer rows (will be deduped later) */
      offerRows.push({
        product_id: productId,
        seller_id: SELLER_ID,
        sku_external: String(row.SKU),
        price_numeric: Number(row.Pret_Lista) || 0,
        stock: Number(row.stoc) || 0,
        is_active: true,
        lead_time_days: null,
        currency: "RON",
      });
      offerTyRows.push({
        offer_id: null, // fill after insert
        min_depth_mm: depthMm,
        quality_grade: row.Calitate,
      });

      /* 6. stage tags */
      if (row.Etichete) {
        row.Etichete.split(",")
          .map((raw) =>
            textOrFallback(raw)
              .replace(/^Anvelope\s+/i, "")
              .trim(),
          )
          .filter(Boolean)
          .forEach(async (tagValue) => {
            const tagId = await lookupId(
              "tag",
              { value: tagValue, slug: makeSlug(tagValue) },
              tx,
            );
            productTags.push({ product_id: productId, tag_id: tagId });
          });
      }
    } // end for-each

    /* 7. de-dup offers by (seller,sku,product) */
    const unique = new Map<string, number>(); // → index in arrays
    offerRows.forEach((o, i) => {
      const key = `${o.seller_id}|${o.sku_external}|${o.product_id}`;
      unique.set(key, i);
    });
    const finalOffers = Array.from(unique.values(), (idx) => offerRows[idx]);
    const finalOfferTy = Array.from(unique.values(), (idx) => offerTyRows[idx]);

    /* 8. bulk insert offers */
    const insertedOffers = await tx.any(
      pgp.helpers.insert(finalOffers, csOffer) +
        ` ON CONFLICT (seller_id,sku_external,product_id)
        DO UPDATE SET price_numeric=EXCLUDED.price_numeric,
                      stock        = EXCLUDED.stock,
                      updated_at   = now()
        RETURNING id`,
    );
    insertedOffers.forEach((row, i) => (finalOfferTy[i].offer_id = row.id));

    /* 9. bulk insert offer_tyres */
    await tx.none(
      pgp.helpers.insert(finalOfferTy, csOfferTy) +
        ` ON CONFLICT (offer_id) DO UPDATE SET min_depth_mm=EXCLUDED.min_depth_mm`,
    );

    /* 10. bulk insert product_tag */
    if (productTags.length)
      await tx.none(
        pgp.helpers.insert(productTags, csProdTag) + " ON CONFLICT DO NOTHING",
      );

    console.info(`  skipped ${skippedBadDim} rows due to bad dimensions`);
  });

  console.info(`  flushed ${feedRows.length} rows`);
}

/* ───── RUN ─────────────────────────────────────────────── */
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
