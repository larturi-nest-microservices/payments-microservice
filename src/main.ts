import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('Payments Microservice');

  const app = await NestFactory.create(AppModule);
  await app.listen(envs.port);

  logger.log(`Payments Microservice runing on port ${envs.port}`);
}
bootstrap();
