import { IoAdapter } from '@nestjs/platform-socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ServerOptions } from 'socket.io';
import {ConfigService} from "@nestjs/config";

@Injectable()
export class RedisIoAdapter extends IoAdapter implements OnModuleInit {
    private adapterConstructor: ReturnType<typeof createAdapter>;
    constructor(private configService:ConfigService) {
        super()
    }
    async onModuleInit() {
        await this.connectToRedis();
    }

    async connectToRedis(): Promise<void> {
        const redisUrl =this.configService.get<string>('redis.url')
        const redisUsername =this.configService.get<string>('redis.username')
        const redisPassword =this.configService.get<string>('redis.password')

        const pubClient = createClient({
            url: redisUrl,
            username: redisUsername,
            password: redisPassword,
        });
        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);

        this.adapterConstructor = createAdapter(pubClient, subClient);
    }

    createIOServer(port: number, options?: ServerOptions): any {
        const server = super.createIOServer(port, options);
        server.adapter(this.adapterConstructor);
        return server;
    }
}