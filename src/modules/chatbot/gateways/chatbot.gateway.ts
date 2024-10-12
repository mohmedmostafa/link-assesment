import {WebSocketGateway, SubscribeMessage, WebSocketServer, ConnectedSocket, MessageBody} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import {ChatbotService} from '../services/chatbot.service';
import {SendMessageDto} from "../dto/sendMessage.dto";
import {Injectable, ValidationPipe} from "@nestjs/common";
import {GlobalWebSocketGateway} from "../../../config/web-socket-gateway.config";

@WebSocketGateway()
export class ChatbotGateway {
    constructor(private chatbotService: ChatbotService,private globalWebSocketGateway:GlobalWebSocketGateway) {
    }

    @SubscribeMessage('message')
    async handleMessage(@MessageBody(new ValidationPipe({transform: true})) messagePayload: SendMessageDto, @ConnectedSocket() client: Socket) {
        messagePayload.clientId="670991506145238731571b42" //todo: replace this id by auth user id
        const response = await this.chatbotService.processMessage(messagePayload, client.id);
        if (response.isAgentConnected){
            this.globalWebSocketGateway.sendMessageToClient(response.agentSocketId,'message', {message: messagePayload.text});
        }else{
            this.globalWebSocketGateway.emit('message', {message: response.answer},client);
        }
    }
}
