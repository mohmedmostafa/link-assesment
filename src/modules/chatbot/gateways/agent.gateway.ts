import {Controller, Injectable} from '@nestjs/common';
import {WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatbotService } from '../services/chatbot.service';
import {GlobalWebSocketGateway} from "../../../config/web-socket-gateway.config";

@WebSocketGateway()
export class AgentGateway {
    constructor(private chatbotService: ChatbotService,private globalWebSocketGateway:GlobalWebSocketGateway) {}

    @SubscribeMessage('agentConnect')
    handleAgentConnect(@MessageBody() message: any, @ConnectedSocket()client: Socket) {
        this.chatbotService.connectAgentToClient(client.id);
        this.globalWebSocketGateway.emit('agentConnected', { message: `You are now connected as an agent. -> id:${client.id}` },client);
    }


    @SubscribeMessage('agentMessage')
    handleAgentMessage(@MessageBody() message: any,@ConnectedSocket() client: Socket) {
        const clientSocketId = message.clientSocketId;
        this.globalWebSocketGateway.sendMessageToClient(clientSocketId,'message', { message: message.text });
    }


    @SubscribeMessage('agentDisconnect')
    handleAgentDisconnect(@MessageBody() message: any, @ConnectedSocket()client: Socket) {
        this.chatbotService.disconnectAgent();
        this.globalWebSocketGateway.emit('agentDisconnected', { message: 'You have been disconnected as an agent.' },client);
    }
}
