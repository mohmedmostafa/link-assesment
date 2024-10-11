import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ChatbotModule} from "./modules/chatbot/chatbot.module";
import {ConfigsModule} from "./config/config.module";

@Module({
  imports: [ConfigsModule,ChatbotModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
