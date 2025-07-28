// src/modules/catalog/tyres/tyres.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma } from "@prisma/client"; // ← enum access
import { tyreMap } from "src/lib/utils/tyre-map"; // Import the tyre map

import { ListTyresDto } from "../dto/list-tyres.dto";

@Injectable()
export class TyresService {
  constructor(private prisma: PrismaService) {}

  async list(dto: ListTyresDto) {
    const {
      q,
      type,
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
      ...(type && { tyre_type: tyreMap[type] }), // Use the tyreMap to convert type
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

  /** PDP query – one SQL call, throws 404 if slug unknown */
  async bySlug(slug: string) {
    try {
      return await this.prisma.product.findUniqueOrThrow({
        where: { slug },
        include: {
          brand: { select: { name: true, slug: true } },
          model: { select: { name: true, slug: true } },

          product_tyres: {
            include: {
              dimension: true,
              season: true,
            },
          },

          /*  long-form marketing copy stored locally;
              if you later sync from Strapi the table name stays the same */
          product_copy: true,

          /*  ALL commercial rows for the SKU, cheapest first  */
          offer: {
            include: {
              offer_tyres: true, // depth_mm, quality_grade
              offer_meta: true, // warehouse, promo, b2b_only …
              partner_price: {
                // every partner tier for that offer
                include: { partner_tier: true },
              },
            },
            orderBy: { price_numeric: "asc" },
          },

          tags: { select: { tag: { select: { value: true, slug: true } } } },

          _count: { select: { offer: true } },
        },
      });
    } catch {
      throw new NotFoundException(`Tyre with slug “${slug}” not found`);
    }
  }
}
