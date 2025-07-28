-- AlterTable
ALTER TABLE "product_tyres" ADD COLUMN     "axel_position" TEXT,
ADD COLUMN     "budget_bucket" TEXT,
ADD COLUMN     "km_garantee" INTEGER,
ADD COLUMN     "quality_rgba" TEXT,
ADD COLUMN     "tread_depth_mm" DECIMAL(3,1),
ADD COLUMN     "tread_percentage_remaining" INTEGER,
ADD COLUMN     "tyre_type" TEXT,
ADD COLUMN     "usage_destination" TEXT;

-- CreateTable
CREATE TABLE "offer_meta" (
    "offer_id" BIGINT NOT NULL,
    "warehouse" TEXT,
    "promo_price_numeric" DECIMAL(10,2),
    "promo_price_valid_until" TIMESTAMPTZ(6),
    "b2b_only" BOOLEAN DEFAULT false,
    "partner_prices_json" JSONB,

    CONSTRAINT "offer_meta_pkey" PRIMARY KEY ("offer_id")
);

-- CreateTable
CREATE TABLE "product_copy" (
    "product_id" BIGINT NOT NULL,
    "hero_json" JSONB,
    "pricing_json" JSONB,
    "photo_json" JSONB,
    "description_json" JSONB,
    "overlay_s" JSONB,
    "overlay_l" JSONB,
    "legacy_slug" TEXT,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_copy_pkey" PRIMARY KEY ("product_id")
);

-- CreateIndex
CREATE INDEX "offer_meta_warehouse_idx" ON "offer_meta"("warehouse");

-- AddForeignKey
ALTER TABLE "offer_meta" ADD CONSTRAINT "offer_meta_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offer"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_copy" ADD CONSTRAINT "product_copy_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
