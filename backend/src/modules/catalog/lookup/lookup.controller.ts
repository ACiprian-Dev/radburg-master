import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOkResponse } from "@nestjs/swagger";

import { LookupService } from "./lookup.service";

@ApiTags("catalog ")
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
  findTyreHeights() {
    return this.lookupService.findTyreHeights();
  }

  @Get("tyre-rim-diameters")
  @ApiOkResponse({
    description: "Returns a list of distinct tyre rim diameters.",
    type: Array,
  })
  findTyreRimDiameter() {
    return this.lookupService.findTyreRimDiameter();
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
