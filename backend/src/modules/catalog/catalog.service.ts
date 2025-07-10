import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

// backend/src/modules/catalog/catalog.service.ts
@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  findBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        model: true,
        product_tyres: {
          include: {
            dimension: true,
            season: true,
          },
        },
        offer: {
          where: { is_active: true },
          include: { offer_tyres: true, seller: true },
        },
      },
    });
  }

  findTyreDimensions() {
    return this.prisma.dimension.findMany({
      orderBy: { width_mm: "asc" },
    });
  }

  findTyreSeasons() {
    return this.prisma.season.findMany({
      orderBy: { name: "asc" },
    });
  }

  findTyreBrands() {
    return this.prisma.brand.findMany({
      orderBy: { name: "asc" },
    });
  }
}
