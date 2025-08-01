import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class LookupService {
  constructor(private readonly prisma: PrismaService) {}

  findTyreDimensions() {
    return this.prisma.dimension.findMany({
      orderBy: { width_mm: "asc" },
    });
  }

  findTyreWidths() {
    return this.prisma.dimension.findMany({
      select: { width_mm: true },
      distinct: ["width_mm"],
      orderBy: { width_mm: "asc" },
    });
  }

  findTyreHeights(width_mm?: string) {
    return this.prisma.dimension.findMany({
      select: { height_pct: true },
      distinct: ["height_pct"],
      orderBy: { height_pct: "asc" },
      where: width_mm ? { width_mm } : undefined,
    });
  }

  findTyreRimDiameter(width_mm?: string, height_pct?: string) {
    return this.prisma.dimension.findMany({
      select: { rim_diam_in: true },
      distinct: ["rim_diam_in"],
      orderBy: { rim_diam_in: "asc" },
      where: {
        ...(width_mm ? { width_mm: Number(width_mm) } : {}),
        ...(height_pct ? { height_pct: Number(height_pct) } : {}),
      },
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
