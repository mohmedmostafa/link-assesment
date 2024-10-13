import {Global, Module} from '@nestjs/common';
import configuration from "./configuration";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {RedisIoAdapter} from "./redisIoAdapter.config";
import {GlobalWebSocketGateway} from "./web-socket-gateway.config";
import {initRedis} from "./redis.config";
import {initMongoDatabase} from "./database.config";


@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
            isGlobal: true,
            envFilePath: `${process.cwd()}/src/env/.env`,
        }),
    ],
    providers: [RedisIoAdapter, GlobalWebSocketGateway, {
        provide: 'REDIS_CLIENT',
        useFactory: initRedis,
        inject: [ConfigService],
    },
        {
            provide: 'MONGO_CLIENT',
            useFactory: initMongoDatabase,
            inject: [ConfigService],
        }],
    exports: [RedisIoAdapter, GlobalWebSocketGateway, 'REDIS_CLIENT', 'MONGO_CLIENT']
})
export class ConfigsModule {
}