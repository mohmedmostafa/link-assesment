import { Module } from '@nestjs/common';
import {DatabaseService} from "../../config/database.config";
import {ChatbotService} from "./services/chatbot.service";
import {AgentGateway} from "./gateways/agent.gateway";
import {ChatbotGateway} from "./gateways/chatbot.gateway";
import {MessageService} from "./services/message.service";
import {ChatbotController} from "./controllers/chatbot.controller";


@Module({
    imports:[

    ],
    controllers:[ChatbotController],
    providers: [ChatbotService,DatabaseService,AgentGateway,ChatbotGateway,MessageService],
})
export class ChatbotModule {}