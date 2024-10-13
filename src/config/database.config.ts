import {MongoClient} from 'mongodb';
import {Injectable, OnModuleInit} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";

export async function initMongoDatabase(configService: ConfigService) {
    const mongoUri = configService.get<string>('database.mongoUri')
    const mongoDbName= configService.get<string>('database.name')
        const enhancedLogEnabled = configService.get<number>('database.logging') == 1
        let client = new MongoClient(mongoUri, {monitorCommands: enhancedLogEnabled});
        if (enhancedLogEnabled)
            client.on('commandStarted', (event) => console.debug(event));
        await client.connect();
        let db = client.db(mongoDbName);
        return db
}




// @Injectable()
// export class DatabaseService implements OnModuleInit {
//     private client: MongoClient;
//     private db;
//
//     constructor(private configService: ConfigService) {
//     }
//
//     async onModuleInit() {
//         const mongoUri = this.configService.get<string>('database.mongoUri')
//         const enhancedLogEnabled = this.configService.get<number>('database.logging') == 1
//         this.client = new MongoClient(mongoUri, {monitorCommands: enhancedLogEnabled});
//         if (enhancedLogEnabled)
//             this.client.on('commandStarted', (event) => console.debug(event));
//         await this.client.connect();
//         this.db = this.client.db('chatbot_db');
//     }
//
//     async getDatabase(): Promise<any>  {
//         return this.db;
//     }
//
//     async onModuleDestroy() {
//         await this.client.close();
//     }
// }