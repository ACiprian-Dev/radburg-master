import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import { BigIntInterceptor } from "./common/interceptors/bigint.interceptor";

// backend/src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new BigIntInterceptor());

  // Tell Nest to run module-level OnModuleDestroy hooks on shutdown
  app.enableShutdownHooks();

  /* --- Swagger --- */
  const config = new DocumentBuilder()
    .setTitle("AnvelopePlus API")
    .setDescription("Product catalogue & ordering endpoints")
    .setVersion("0.1")
    .addTag("catalog")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document); // UI at /api

  console.log("Nest application is starting... on port 3000");
  await app.listen(3000);
}
bootstrap();
