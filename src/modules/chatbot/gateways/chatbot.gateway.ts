import {WebSocketGateway, SubscribeMessage, WebSocketServer, ConnectedSocket, MessageBody} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import {ChatbotService} from '../services/chatbot.service';
import {SendMessageDto} from "../dto/sendMessage.dto";
import {Injectable, ValidationPipe} from "@nestjs/common";
import {GlobalWebSocketGateway} from "../../../config/web-socket-gateway.config";
import {AgentRoomsService} from "../services/agent-rooms.service";

@WebSocketGateway()
export class ChatbotGateway {
    constructor(private chatbotService: ChatbotService, private globalWebSocketGateway: GlobalWebSocketGateway, private agentRoomsService: AgentRoomsService) {
    }

    myId = "670991506145238731571b42"

    @SubscribeMessage('userConnect')
    async handleAgentConnect(@MessageBody() message: any, @ConnectedSocket() client: Socket) {

        await this.agentRoomsService.connectUserToClient(client.id, this.myId);
        this.globalWebSocketGateway.emit('userConnected', {message: `You are now connected as an user. -> id:${client.id}`}, client);
    }


    @SubscribeMessage('message')
    async handleMessage(@MessageBody(new ValidationPipe({transform: true})) messagePayload: SendMessageDto, @ConnectedSocket() client: Socket) {
        messagePayload.clientId = this.myId //todo: replace this id by auth user id
        const response = await this.chatbotService.processMessage(messagePayload, client.id);
        console.log("handleMessage", {response})
        if (response.isAgentConnected) {
            this.globalWebSocketGateway.server.sockets.sockets.get(response.agentSocketId).join(response.roomId)
            client.join(response.roomId)
            this.globalWebSocketGateway.emitToRoom(response.roomId, 'message', {message: messagePayload.text}, client);
        } else {
            this.globalWebSocketGateway.emit('message', {message: response.answer}, client);
        }

        // client.on('disconnecting', (reason) => {
        //     console.log(`DISCONNECTING: ${Array.from(client.rooms)}`); // Set { ... }
        // });
    }
}
