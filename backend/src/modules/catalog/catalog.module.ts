import { Module } from "@nestjs/common";

import { CatalogService } from "./catalog.service";
import { CatalogController } from "./catalog.controller";

@Module({
  providers: [CatalogService],
  exports: [CatalogService],
  controllers: [CatalogController],
})
export class CatalogModule {
  // This module currently does not provide any services or exports.
  // It can be extended in the future to include providers or exports as needed.
}
