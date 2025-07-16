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
