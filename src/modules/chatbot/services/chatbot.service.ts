import {Injectable} from '@nestjs/common';
import {DatabaseService} from "../../../config/database.config";
import {SendMessageDto} from "../dto/sendMessage.dto";

@Injectable()
export class ChatbotService {
    private agentAvailable = false;
    private agentSocketId = null;

    constructor(private dbService: DatabaseService) {
    }

    async processMessage(message: SendMessageDto, clientSocketId: string): Promise<any> {
        const db = this.dbService.getDatabase();
        const faqCollection = db.collection('faq');
        console.log({clientSocketId})


        // If no agent, try to find an answer in the chatbot FAQ
        const answer = await faqCollection.findOne({question: {$regex: new RegExp(message.text, 'i')}});
        if (answer) {
            return {isAgentConnected: false, answer: answer.answer};
        } else {
            // Check if the agent is available
            if (this.agentAvailable) {
                // Agent is available, forward the message to the agent
                return {
                    isAgentConnected: true,
                    answer: `Agent is responding to: ${message.text}`,
                    agentSocketId: this.agentSocketId,
                };
            }
            return {
                isAgentConnected: false,
                answer: "I don't know the answer to that. Let me connect you to an agent."
            };
        }
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
