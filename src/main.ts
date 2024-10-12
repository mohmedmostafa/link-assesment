import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {RedisIoAdapter} from "./config/redisIoAdapter.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //add redis adapter
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
