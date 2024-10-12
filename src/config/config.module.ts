import {Global, Module} from '@nestjs/common';
import {DatabaseService} from "./database.config";
import configuration from "./configuration";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {RedisIoAdapter} from "./redisIoAdapter.config";
import {GlobalWebSocketGateway} from "./web-socket-gateway.config";
import {RedisConfig} from "./redis.config";
import {createClient} from "redis";


@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
            isGlobal: true,
            envFilePath: `${process.cwd()}/src/env/.env`,
        }),
    ],
    providers: [DatabaseService,RedisIoAdapter,GlobalWebSocketGateway, {
        provide: 'REDIS_CLIENT',
        useFactory: async (configService: ConfigService) => {
            const redisUrl =configService.get<string>('redis.url')
            const redisUsername =configService.get<string>('redis.username')
            const redisPassword =configService.get<string>('redis.password')

            const redisClient = createClient({
                url: redisUrl,
                username: redisUsername,
                password: redisPassword,
            });

            const loggingEnabled = configService.get<number>('REDIS_LOGGING') === 1;
            if (loggingEnabled) {
                redisClient.on('error', (err) => console.error('Redis error:', err));
            }

            await redisClient.connect();
            return redisClient;
        },
        inject: [ConfigService],
    }],
    exports:[DatabaseService,RedisIoAdapter,GlobalWebSocketGateway,'REDIS_CLIENT']
})
export class ConfigsModule {
}