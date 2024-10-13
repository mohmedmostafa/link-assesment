import {Controller, Injectable} from '@nestjs/common';
import {WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatbotService } from '../services/chatbot.service';
import {GlobalWebSocketGateway} from "../../../config/web-socket-gateway.config";
import {AgentRoomsService} from "../services/agent-rooms.service";
import {RedisKeys} from "../consts/redis-keys";

@WebSocketGateway()
export class AgentGateway {
    constructor(private chatbotService: ChatbotService,private globalWebSocketGateway:GlobalWebSocketGateway, private agentRoomsService:AgentRoomsService) {}

    @SubscribeMessage('agentConnect')
    handleAgentConnect(@MessageBody() message: any, @ConnectedSocket()client: Socket) {
        this.agentRoomsService.connectAgentToClient(client.id,message.myId);
        this.globalWebSocketGateway.emit('agentConnected', { message: `You are now connected as an agent. -> id:${client.id}` },client);
    }


    @SubscribeMessage('agentMessage')
    async handleAgentMessage(@MessageBody() message: any,@ConnectedSocket() client: Socket) {
        let roomDoc=await this.agentRoomsService.getUserRoom(message.myId,RedisKeys.AgentRoomId)
        console.log("processMessage",{roomDoc})
        if (!roomDoc){
            return {
                answer: `your are not connected to any room`,
            };
        }
        this.globalWebSocketGateway.server.sockets.sockets.get(roomDoc.agentSocketId).join(roomDoc.roomId)
        client.join(roomDoc.roomId)
        this.globalWebSocketGateway.emitToRoom(roomDoc.roomId, 'message', {message: message.text}, client);
    }


    @SubscribeMessage('agentDisconnect')
    handleAgentDisconnect(@MessageBody() message: any, @ConnectedSocket()client: Socket) {
        this.agentRoomsService.disconnectAgent(client.id,message.myId);
        this.globalWebSocketGateway.emit('agentDisconnected', { message: 'You have been disconnected as an agent.' },client);
    }
}
