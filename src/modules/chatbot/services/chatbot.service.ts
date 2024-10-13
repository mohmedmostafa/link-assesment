import {Inject, Injectable} from '@nestjs/common';
import {SendMessageDto} from "../dto/sendMessage.dto";
import {MessageService} from "./message.service";
import {AgentRoomsService} from "./agent-rooms.service";
import {RedisKeys} from "../consts/redis-keys";
import {Db} from "mongodb";

@Injectable()
export class ChatbotService {

    constructor(@Inject('MONGO_CLIENT') private readonly dbService: Db,private messageService:MessageService,private agentRoomsService:AgentRoomsService) {
    }

    async processMessage(message: SendMessageDto, clientSocketId: string): Promise<any> {
        const faqCollection = this.dbService.collection('faq');

        await this.messageService.queueMessage({message: message.text,receiverId:"",senderId:message.clientId,timestamp:new Date()})

        // If no agent, try to find an answer in the chatbot FAQ
        const answer = await faqCollection.findOne({question: {$regex: new RegExp(message.text, 'i')}});
        if (answer) {
            return {isAgentConnected: false, answer: answer.answer};
        }
        //already joined to room
        let roomDoc=await this.agentRoomsService.getUserRoom(message.clientId,RedisKeys.User)
            console.log("processMessage",{roomDoc})
        if (roomDoc){
            return {
                isAgentConnected: true,
                answer: `Agent is responding to: ${message.text}`,
                roomId: roomDoc.roomId,
                agentSocketId:roomDoc.agentSocketId,
            };
        }

        // Check if the agent is available
        let agentDoc=await this.agentRoomsService.getAvailableAgent()
        if (agentDoc) {
            const roomKey=await this.agentRoomsService.assignUserToRoom(message.clientId,agentDoc.agentId)
            // Agent is available, forward the message to the agent
            return {
                isAgentConnected: true,
                answer: `Agent is responding to: ${message.text}`,
                roomId: roomKey,
                agentSocketId:agentDoc.agentSocketId
            };
        }

        //default
        return {
            isAgentConnected: false,
            answer: "I don't know the answer to that. Let me connect you to an agent."
        };

    }
}
