import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiOkResponse } from "@nestjs/swagger";

import { LookupService } from "./lookup.service";

@ApiTags("catalog/lookup")
@Controller("catalog/lookup")
export class LookupController {
  constructor(private readonly lookupService: LookupService) {}

  @Get("tyre-dimensions")
  @ApiOkResponse({
    description: "Returns a list of tyre dimensions.",
    type: Array,
  })
  findTyreDimensions() {
    return this.lookupService.findTyreDimensions();
  }

  @Get("tyre-widths")
  @ApiOkResponse({
    description: "Returns a list of distinct tyre widths.",
    type: Array,
  })
  findTyreWidths() {
    return this.lookupService.findTyreWidths();
  }

  @Get("tyre-heights")
  @ApiOkResponse({
    description: "Returns a list of distinct tyre heights.",
    type: Array,
  })
  findTyreHeights(@Query("width_mm") width_mm?: string) {
    return this.lookupService.findTyreHeights(width_mm);
  }

  @Get("tyre-rim-diameters")
  @ApiOkResponse({
    description: "Returns a list of distinct tyre rim diameters.",
    type: Array,
  })
  findTyreRimDiameter(
    @Query("width_mm") width_mm?: string,
    @Query("height_pct") height_pct?: string,
  ) {
    return this.lookupService.findTyreRimDiameter(width_mm, height_pct);
  }

  @Get("seasons")
  @ApiOkResponse({
    description: "Returns a list of tyre seasons.",
    type: Array,
  })
  findTyreSeasons() {
    return this.lookupService.findTyreSeasons();
  }

  @Get("brands")
  @ApiOkResponse({ description: "Returns a list of tyre brands.", type: Array })
  findTyreBrands() {
    return this.lookupService.findTyreBrands();
  }
}
