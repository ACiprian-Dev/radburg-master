import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";

import { LookupController } from "./lookup.controller";
import { LookupService } from "./lookup.service";

@Module({
  imports: [PrismaModule],
  controllers: [LookupController],
  providers: [LookupService],
})
export class LookupModule {}
