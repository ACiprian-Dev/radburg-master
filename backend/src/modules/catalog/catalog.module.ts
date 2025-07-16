import { Module } from "@nestjs/common";

import { LookupModule } from "./lookup/lookup.module";

@Module({
  imports: [LookupModule],
  exports: [LookupModule],
})
export class CatalogModule {
  // This module currently does not provide any services or exports.
  // It can be extended in the future to include providers or exports as needed.
}
