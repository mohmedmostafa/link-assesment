import { Module } from '@nestjs/common';
import {DatabaseService} from "./database.config";
import configuration from "./configuration";
import {ConfigModule} from "@nestjs/config";
import {RedisIoAdapter} from "./redisIoAdapter.config";



@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
            isGlobal: true,
            envFilePath: `${process.cwd()}/src/env/.env`,
        }),
    ],
    providers: [DatabaseService,RedisIoAdapter],
    exports:[DatabaseService,RedisIoAdapter]
})
export class ConfigsModule {
}