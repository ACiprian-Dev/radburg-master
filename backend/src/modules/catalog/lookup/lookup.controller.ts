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
