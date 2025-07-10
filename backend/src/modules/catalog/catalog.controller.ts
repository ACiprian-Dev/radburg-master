import { Controller, Get, Param } from "@nestjs/common";

import { CatalogService } from "./catalog.service";

@Controller("catalog")
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // 1️⃣ declare a real route-parameter  ➜  products/:slug
  // 2️⃣ use @Param() to read it
  @Get("products/:slug")
  findBySlug(@Param("slug") slug: string) {
    return this.catalogService.findBySlug(slug);
  }
  @Get("tyre-dimensions")
  findTyreDimensions() {
    return this.catalogService.findTyreDimensions();
  }
  @Get("seasons")
  findTyreSeasons() {
    return this.catalogService.findTyreSeasons();
  }
  @Get("brands")
  findTyreBrands() {
    return this.catalogService.findTyreBrands();
  }
}
