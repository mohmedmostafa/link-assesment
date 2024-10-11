import {MongoClient} from 'mongodb';
import {Injectable, OnModuleInit} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";

@Injectable()
export class DatabaseService implements OnModuleInit {
    private client: MongoClient;
    private db;

    constructor(private configService: ConfigService) {
    }

    async onModuleInit() {
        const mongoUri = this.configService.get<string>('database.mongoUri')
        const enhancedLogEnabled = this.configService.get<number>('database.logging') == 1
        this.client = new MongoClient(mongoUri, {monitorCommands: enhancedLogEnabled});
        if (enhancedLogEnabled)
            this.client.on('commandStarted', (event) => console.debug(event));
        await this.client.connect();
        this.db = this.client.db('chatbot_db');
    }

    getDatabase() {
        return this.db;
    }

    async onModuleDestroy() {
        await this.client.close();
    }
}