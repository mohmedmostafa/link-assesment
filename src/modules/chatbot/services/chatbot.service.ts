import {Injectable} from '@nestjs/common';
import {DatabaseService} from "../../../config/database.config";
import {SendMessageDto} from "../dto/sendMessage.dto";
import {MessageService} from "./message.service";

@Injectable()
export class ChatbotService {
    private agentAvailable = false;
    private agentSocketId = null;

    constructor(private dbService: DatabaseService,private messageService:MessageService) {
    }

    async processMessage(message: SendMessageDto, clientSocketId: string): Promise<any> {
        const db = this.dbService.getDatabase();
        const faqCollection = db.collection('faq');

        await this.messageService.queueMessage({message: message.text,receiverId:"",senderId:message.clientId,timestamp:new Date()})

        // If no agent, try to find an answer in the chatbot FAQ
        const answer = await faqCollection.findOne({question: {$regex: new RegExp(message.text, 'i')}});
        if (answer) {
            return {isAgentConnected: false, answer: answer.answer};
        }

        // Check if the agent is available
        if (this.agentAvailable) {
            // Agent is available, forward the message to the agent
            return {
                isAgentConnected: true,
                answer: `Agent is responding to: ${message.text}`,
                agentSocketId: this.agentSocketId,
            };
        }

        //default
        return {
            isAgentConnected: false,
            answer: "I don't know the answer to that. Let me connect you to an agent."
        };

    }

    // Method to connect an agent to a client
    connectAgentToClient(agentSocketId: string) {
        this.agentAvailable = true;
        this.agentSocketId = agentSocketId;
    }

    // Method to disconnect agent
    disconnectAgent() {
        this.agentAvailable = false;
        this.agentSocketId = null;
    }
}
