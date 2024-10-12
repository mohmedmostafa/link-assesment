import { Module, Global } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';

// Global WebSocketGateway setup
@WebSocketGateway({
    cors: {
        origin: '*',
        //todo:should be replaced by the real domain name of frontend
    },
})
export class GlobalWebSocketGateway {
    @WebSocketServer()
    server: Server;

     emit(event:string,message: any,client: Socket) {
          client.emit(event, message);
    }

     sendMessageToClient(clientId: string,event:string, message: any) {
         this.server.to(clientId).emit(event, message);
    }
}


