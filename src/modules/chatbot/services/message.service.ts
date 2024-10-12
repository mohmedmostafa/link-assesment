import {Inject, Injectable} from '@nestjs/common';
import { Collection } from 'mongodb';
import {Message} from "../schemas/message.schema";
import {DatabaseService} from "../../../config/database.config";
import {RedisConfig} from "../../../config/redis.config";
import { v4 as uuidv4 } from 'uuid';
import {RedisClientType} from "redis";


@Injectable()
export class MessageService {

    private readonly BATCH_SIZE = 20;
    private readonly BATCH_TIMEOUT = 5000;
    private batchId:string=uuidv4();

    private messageBuffer: Message[] = [];
    private batchTimeout: NodeJS.Timeout;
    private messagesCollection: Collection;

    constructor(
        private dbService: DatabaseService,
        @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType
    ) {}

    private  async saveMessageToRedis(message: Message): Promise<void> {
        const key = `messages:${message.senderId}:${this.batchId}`;
        await this.redisClient.rPush(key, JSON.stringify(message));
    }

     private async batchInsertMessages(): Promise<void> {
        if (this.messageBuffer.length === 0) return;

        const bulkMessages = [...this.messageBuffer];
        this.messageBuffer = [];
        const OldBatchId=this.batchId
        this.batchId=uuidv4()

        const db = this.dbService.getDatabase();
        this.messagesCollection = db.collection('messages');
        await this.messagesCollection.insertMany(bulkMessages);
        console.log('Inserted batch of messages:', bulkMessages.length,OldBatchId);

        // remove messages from Redis after they are saved to mongodb
        bulkMessages.forEach(async (msg) => {
            const key = `messages:${msg.senderId}:${OldBatchId}`;
            await this.redisClient.DEL(key);
        });
    }

    // batch messages
    async queueMessage(message: Message): Promise<void> {
        this.messageBuffer.push(message);
        await this.saveMessageToRedis(message);


        if (this.messageBuffer.length >= this.BATCH_SIZE) {
            await this.batchInsertMessages();
        }


        if (!this.batchTimeout) {
            this.batchTimeout = setTimeout(async () => {
                await this.batchInsertMessages();
                this.batchTimeout = null;
            }, this.BATCH_TIMEOUT);
        }
    }

    // get all messages from both Redis and MongoDB
    async getAllMessages(userId: string): Promise<Message[]> {
        const redisMessages = await this.redisClient.lRange(`messages:${userId}*`, 0, -1);
        const cachedMessages = redisMessages.map((msg) => JSON.parse(msg));
        const filter={ "$or":[{senderId: userId},{receiverId: userId}] }
        const dbMessages = await this.messagesCollection.find(filter,{"sort":{"timestamp":-1}}).toArray();

        return [...dbMessages, ...cachedMessages];
    }
}
