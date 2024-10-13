import {Module, Global, OnModuleInit} from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';

// Global WebSocketGateway setup
@WebSocketGateway({
    cors: {
        origin: '*',
        //todo:should be replaced by the real domain name of frontend
    },
})
export class GlobalWebSocketGateway  {
    @WebSocketServer()
    server: Server;

     emit(event:string,message: any,client: Socket) {
         console.log('Available connected clients:', this.server.sockets.sockets.keys());

         client.emit(event, message);
    }
    emitToRoom(roomId:string,event:string,message: any,client: Socket) {
        console.log('Available connected clients:', this.server.sockets.sockets.keys());

        client.to(roomId).emit(event, message);
    }

     sendMessageToClient(clientId: string,event:string, message: any) {
         console.log('Available connected clients:', this.server.sockets.sockets.keys());

         this.server.to(clientId).emit(event, message);
    }

}


