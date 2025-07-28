// src/catalog/tyres.controller.ts
import { Controller, Get, Param, Query } from "@nestjs/common";

import { ListTyresDto } from "../dto/list-tyres.dto";

import { TyresService } from "./tyres.service";

@Controller("tyres") // final path = /tyres
export class TyresController {
  constructor(private service: TyresService) {}

  @Get()
  list(@Query() dto: ListTyresDto) {
    return this.service.list(dto);
  }

  @Get(":slug")
  bySlug(@Param("slug") slug: string) {
    return this.service.bySlug(slug);
  }

  // // optional: /tyres/:slug/offers       (lazy-load variants)
  // @Get(':slug/offers')
  // offers(@Param('slug') slug: string) {
  //   return this.service.bySlug(slug).then(p => p.offer);
  // }
}
