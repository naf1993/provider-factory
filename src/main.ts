import {
  NestFactory,
} from '@nestjs/core';

import {
  ConfigService,
} from '@nestjs/config';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const app =
    await NestFactory.create(
      AppModule,
    );

  const configService =
    app.get(ConfigService);

  const port =
    configService.get<number>(
      'app.port',
    ) ?? 3000;

  app.enableShutdownHooks();

  await app.listen(port);

  console.log(
    `Provider Data Factory running on http://localhost:${port}`,
  );
}

bootstrap();