// backend/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({ log: ["info", "error", "warn"] });
  }

  async onModuleInit() {
    await this.$connect();
  }

  /** Called automatically when Nest shuts down (SIGTERM, Ctrl-C, etc.) */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
