
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
 import { ConfigService } from '@nestjs/config';
 import { createClient, RedisClientType } from 'redis';

 @Injectable()
 export class RedisConfig implements OnModuleInit, OnModuleDestroy {
     private redisClient: RedisClientType;

     constructor(private configService: ConfigService) {}

     async onModuleInit() {
         const redisUrl =this.configService.get<string>('redis.url')
         const redisUsername =this.configService.get<string>('redis.username')
         const redisPassword =this.configService.get<string>('redis.password')

         this.redisClient = createClient({
             url: redisUrl,
             username: redisUsername,
             password: redisPassword,
         });

         const loggingEnabled = this.configService.get<number>('REDIS_LOGGING') === 1;
         if (loggingEnabled) {
             this.redisClient.on('error', (err) => console.error('Redis error:', err));
         }

         await this.redisClient.connect();
         console.log('Redis client connected');
     }

     getClient(): RedisClientType {
         return this.redisClient;
     }

     async onModuleDestroy() {
         await this.redisClient.disconnect();
         console.log('Redis client disconnected');
     }
 }
