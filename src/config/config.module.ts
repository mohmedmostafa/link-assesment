import {Global, Module} from '@nestjs/common';
import {DatabaseService} from "./database.config";
import configuration from "./configuration";
import {ConfigModule} from "@nestjs/config";
import {RedisIoAdapter} from "./redisIoAdapter.config";
import {GlobalWebSocketGateway} from "./web-socket-gateway.config";


@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
            isGlobal: true,
            envFilePath: `${process.cwd()}/src/env/.env`,
        }),
    ],
    providers: [DatabaseService,RedisIoAdapter,GlobalWebSocketGateway],
    exports:[DatabaseService,RedisIoAdapter,GlobalWebSocketGateway]
})
export class ConfigsModule {
}