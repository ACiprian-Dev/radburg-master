-- CreateEnum
CREATE TYPE "product_type_enum" AS ENUM ('TYRE', 'RIM', 'FULLWHEEL');

-- CreateTable
CREATE TABLE "brand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dimension" (
    "id" SERIAL NOT NULL,
    "width_mm" DECIMAL(4,1) NOT NULL,
    "height_pct" INTEGER,
    "rim_diam_in" DECIMAL(4,1) NOT NULL,

    CONSTRAINT "dimension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "model" (
    "id" SERIAL NOT NULL,
    "brand_id" INTEGER,
    "name" TEXT NOT NULL,

    CONSTRAINT "model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer" (
    "id" BIGSERIAL NOT NULL,
    "product_id" BIGINT,
    "seller_id" INTEGER,
    "sku_external" TEXT NOT NULL,
    "price_numeric" DECIMAL(10,2) NOT NULL,
    "currency" CHAR(3) DEFAULT 'RON',
    "stock" INTEGER NOT NULL,
    "lead_time_days" INTEGER,
    "is_active" BOOLEAN DEFAULT true,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_tyres" (
    "offer_id" BIGINT NOT NULL,
    "min_depth_mm" DECIMAL(3,1),
    "quality_grade" TEXT,

    CONSTRAINT "offer_tyres_pkey" PRIMARY KEY ("offer_id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" BIGSERIAL NOT NULL,
    "product_type" "product_type_enum" NOT NULL,
    "brand_id" INTEGER,
    "model_id" INTEGER,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_fullwheels" (
    "product_id" BIGINT NOT NULL,
    "tyre_product" BIGINT,
    "rim_product" BIGINT,

    CONSTRAINT "product_fullwheels_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "product_raw" (
    "id" BIGSERIAL NOT NULL,
    "payload" JSONB NOT NULL,
    "source" TEXT NOT NULL,
    "fetched_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_raw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_rims" (
    "product_id" BIGINT NOT NULL,
    "diameter_in" DECIMAL(4,1),
    "width_in" DECIMAL(3,1),
    "pcd" TEXT,
    "et_offset_mm" INTEGER,
    "center_bore_mm" DECIMAL(4,1),

    CONSTRAINT "product_rims_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "product_tyres" (
    "product_id" BIGINT NOT NULL,
    "dimension_id" INTEGER,
    "season_id" INTEGER,
    "dot_year" INTEGER,
    "load_index" INTEGER,
    "speed_index" TEXT,
    "depth_bucket" INTEGER,

    CONSTRAINT "product_tyres_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "sales_order" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT,
    "status" TEXT DEFAULT 'NEW',
    "total_gross" DECIMAL(12,2),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sales_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_order_item" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT,
    "offer_id" BIGINT,
    "seller_id" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2),
    "commission_snapshot" DECIMAL(10,2),

    CONSTRAINT "sales_order_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "season" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "vat_code" TEXT,
    "commission_pct" DECIMAL(5,2) DEFAULT 10.00,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slug_history" (
    "old_slug" TEXT NOT NULL,
    "product_id" BIGINT,
    "changed_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "slug_history_pkey" PRIMARY KEY ("old_slug")
);

-- CreateTable
CREATE TABLE "sys_setting" (
    "key" TEXT NOT NULL,
    "val" TEXT NOT NULL,

    CONSTRAINT "sys_setting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "brand_name_key" ON "brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "dimension_width_mm_height_pct_rim_diam_in_key" ON "dimension"("width_mm", "height_pct", "rim_diam_in");

-- CreateIndex
CREATE UNIQUE INDEX "model_brand_id_name_key" ON "model"("brand_id", "name");

-- CreateIndex
CREATE INDEX "offer_price_idx" ON "offer"("price_numeric");

-- CreateIndex
CREATE INDEX "offer_product_idx" ON "offer"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "offer_seller_id_id_uidx" ON "offer"("seller_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "offer_seller_id_sku_external_product_id_key" ON "offer"("seller_id", "sku_external", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_slug_key" ON "product"("slug");

-- CreateIndex
CREATE INDEX "product_raw_src_idx" ON "product_raw"("source");

-- CreateIndex
CREATE UNIQUE INDEX "uq_product_tyre_natural" ON "product_tyres"("dimension_id", "dot_year", "depth_bucket", "season_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "season_name_key" ON "season"("name");

-- CreateIndex
CREATE UNIQUE INDEX "seller_name_key" ON "seller"("name");

-- AddForeignKey
ALTER TABLE "model" ADD CONSTRAINT "model_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brand"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "offer" ADD CONSTRAINT "offer_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "offer" ADD CONSTRAINT "offer_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "seller"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "offer_tyres" ADD CONSTRAINT "offer_tyres_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offer"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brand"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "model"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_fullwheels" ADD CONSTRAINT "product_fullwheels_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_fullwheels" ADD CONSTRAINT "product_fullwheels_rim_product_fkey" FOREIGN KEY ("rim_product") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_fullwheels" ADD CONSTRAINT "product_fullwheels_tyre_product_fkey" FOREIGN KEY ("tyre_product") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_rims" ADD CONSTRAINT "product_rims_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_tyres" ADD CONSTRAINT "product_tyres_dimension_id_fkey" FOREIGN KEY ("dimension_id") REFERENCES "dimension"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_tyres" ADD CONSTRAINT "product_tyres_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_tyres" ADD CONSTRAINT "product_tyres_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "season"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales_order_item" ADD CONSTRAINT "fk_item_seller_match" FOREIGN KEY ("seller_id", "offer_id") REFERENCES "offer"("seller_id", "id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales_order_item" ADD CONSTRAINT "sales_order_item_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales_order_item" ADD CONSTRAINT "sales_order_item_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "sales_order"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "slug_history" ADD CONSTRAINT "slug_history_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

