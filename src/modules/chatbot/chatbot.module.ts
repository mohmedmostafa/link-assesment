import { Module } from '@nestjs/common';
import {DatabaseService} from "../../config/database.config";


@Module({
    providers: [DatabaseService],
})
export class ChatbotModule {}