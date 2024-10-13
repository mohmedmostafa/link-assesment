import { Module } from '@nestjs/common';
import {ChatbotService} from "./services/chatbot.service";
import {AgentGateway} from "./gateways/agent.gateway";
import {ChatbotGateway} from "./gateways/chatbot.gateway";
import {MessageService} from "./services/message.service";
import {ChatbotController} from "./controllers/chatbot.controller";
import {AgentRoomsService} from "./services/agent-rooms.service";


@Module({
    imports:[],
    controllers:[ChatbotController],
    providers: [ChatbotService,AgentGateway,ChatbotGateway,MessageService,AgentRoomsService],
})
export class ChatbotModule {}