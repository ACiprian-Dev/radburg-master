// src/modules/catalog/tyres/tyres.service.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma } from "@prisma/client"; // ← enum access

import { ListTyresDto } from "../dto/list-tyres.dto";

@Injectable()
export class TyresService {
  constructor(private prisma: PrismaService) {}

  async list(dto: ListTyresDto) {
    const {
      q,
      size,
      season,
      brand,
      model,
      page = 1,
      limit = 24,
      sort = "relevance",
    } = dto;

    const tyresFilter: Prisma.product_tyresWhereInput = {
      ...(size && { dimension: { slug: size } }),
      ...(season && { season: { slug: season } }),
    };

    const where: Prisma.productWhereInput = {
      is_visible: true,
      ...(q && { title: { contains: q, mode: Prisma.QueryMode.insensitive } }),
      ...(brand && { brand: { is: { slug: brand } } }),
      ...(model && { model: { slug: model } }),
      ...(Object.keys(tyresFilter).length && {
        product_tyres: { is: tyresFilter },
      }),
    };

    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: {
          brand: { select: { name: true, slug: true } },
          model: { select: { name: true, slug: true } },
          _count: { select: { offer: true } }, // how many offers
          offer: {
            // cheapest price for card
            select: { price_numeric: true },
            orderBy: { price_numeric: "asc" },
            take: 1,
          },
          product_tyres: {
            include: {
              dimension: true,
              season: true,
            },
          },
        },
        orderBy:
          sort === "price"
            ? { order_rank: "asc" } // placeholder; true cheapest needs raw SQL
            : { order_rank: "asc" },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      items,
    };
  }

  async bySlug(slug: string) {
    return this.prisma.product.findUniqueOrThrow({
      where: { slug },
      include: {
        brand: true,
        model: true,
        tags: { select: { tag: true } },
        product_tyres: true,
        offer: {
          // plural
          include: { offer_tyres: true },
          orderBy: { price_numeric: "asc" },
        },
      },
    });
  }
}
