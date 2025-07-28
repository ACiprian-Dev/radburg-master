import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";

import { TyresController } from "./tyres.controller";
import { TyresService } from "./tyres.service";
@Module({
  imports: [PrismaModule],
  controllers: [TyresController],
  providers: [TyresService],
})
export class TyresModule {
  // This module currently does not provide any services or exports.
  // It can be extended in the future to include providers or exports as needed.
}
