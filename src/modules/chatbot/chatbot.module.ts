import { Module } from '@nestjs/common';
import {DatabaseService} from "../../config/database.config";
import {ChatbotService} from "./services/chatbot.service";
import {AgentGateway} from "./gateways/agent.gateway";
import {ChatbotGateway} from "./gateways/chatbot.gateway";


@Module({
    providers: [ChatbotService,DatabaseService,AgentGateway,ChatbotGateway],
})
export class ChatbotModule {}