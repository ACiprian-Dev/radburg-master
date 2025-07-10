// backend/src/prisma/prisma.module.ts
import { Global, Module } from "@nestjs/common";

import { PrismaService } from "./prisma.service";

@Global() // ⇒ available app-wide without re-export
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
