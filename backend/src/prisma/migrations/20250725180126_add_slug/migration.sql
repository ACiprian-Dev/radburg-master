/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `brand` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `dimension` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `model` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[brand_id,slug]` on the table `model` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[offer_id,min_depth_mm,quality_grade]` on the table `offer_tyres` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `season` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `brand` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `dimension` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `model` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `season` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "model_brand_id_name_key";

-- AlterTable
ALTER TABLE "brand" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "dimension" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "model" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "season" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "brand_slug_key" ON "brand"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "dimension_slug_key" ON "dimension"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "model_slug_key" ON "model"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "model_brand_id_slug_key" ON "model"("brand_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "uq_offer_tyres_natural" ON "offer_tyres"("offer_id", "min_depth_mm", "quality_grade");

-- CreateIndex
CREATE UNIQUE INDEX "season_slug_key" ON "season"("slug");
