import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { BigIntInterceptor } from "./common/interceptors/bigint.interceptor";

// backend/src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new BigIntInterceptor());

  // Tell Nest to run module-level OnModuleDestroy hooks on shutdown
  app.enableShutdownHooks();
  console.log("Nest application is starting... on port 3000");
  await app.listen(3000);
}
bootstrap();
