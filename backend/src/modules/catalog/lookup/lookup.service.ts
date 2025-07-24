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

  findTyreHeights() {
    return this.prisma.dimension.findMany({
      select: { height_pct: true },
      distinct: ["height_pct"],
      orderBy: { height_pct: "asc" },
    });
  }

  findTyreRimDiameter() {
    return this.prisma.dimension.findMany({
      select: { rim_diam_in: true },
      distinct: ["rim_diam_in"],
      orderBy: { rim_diam_in: "asc" },
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
