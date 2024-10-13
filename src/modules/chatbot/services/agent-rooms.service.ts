import {Inject, Injectable} from "@nestjs/common";
import {RedisClientType} from "redis";
import {RedisKeys} from "../consts/redis-keys";

@Injectable()
export class AgentRoomsService {
    constructor(@Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType) {
    }


    /**
     *
     * @param agentSocketId: agent socket id
     * @param agentId: agent id form database user schema
     */
    async connectAgentToClient(agentSocketId: string, agentId: string) {
        try {
            const agentKey = `${RedisKeys.Agent}:${agentId}`;
            console.log("connectAgentToClient", {agentSocketId, agentId, agentKey})
            // Update hash values
            await this.redisClient.hSet(agentKey, RedisKeys.AgentSocketId, agentSocketId);
            await this.redisClient.sAdd(RedisKeys.AvailableAgents, agentId);
        } catch (e) {
            console.log(e)
        }

    }

    async connectUserToClient(userSocketId: string, userId: string) {
        try {
            const userKey = `${RedisKeys.User}:${userId}`;
            console.log("connectAgentToClient", {agentSocketId: userSocketId, userId, userKey})
            // Update hash values
            await this.redisClient.hSet(userKey, RedisKeys.AgentSocketId, userSocketId);
        } catch (e) {
            console.log(e)
        }

    }

    // Method to disconnect agent
    async disconnectAgent(agentSocketId: string, agentId: string) {
        try {
            const agentKey = `${RedisKeys.Agent}:${agentId}`;

            // Update hash values
            await this.redisClient.del(agentKey);
            await this.redisClient.sAdd(RedisKeys.AvailableAgents, agentId);
        } catch (e) {
            console.log(e)
        }
    }

    async getAvailableAgent(): Promise<any> {
        try {
            let len = await this.redisClient.sCard(RedisKeys.AvailableAgents)
            if (len <= 0) {
                return null
            }
            let agentId = await this.redisClient.sPop(RedisKeys.AvailableAgents, 1)
            console.log("getAvailableAgent: ", {agentId})
            const agentKey = `${RedisKeys.Agent}:${agentId}`;
            return {
                agentSocketId: await this.redisClient.hGet(agentKey, RedisKeys.AgentSocketId),
                agentId: Array.isArray(agentId) ? agentId[0] : agentId
            }
        } catch (e) {
            console.log(e)
        }
    }

    async assignUserToRoom(userId: string, agentId: string) {
        try {
            const roomId = `${userId}-${agentId}`
            // const roomKey = `${RedisKeys.Room}:${roomId}`;
            // console.log("assignUserToRoom", {userId, agentId})
            // // @ts-ignore
            // await this.redisClient.HSET(roomKey, RedisKeys.AgentId, agentId);

            // Add room to sets for quick search by userId or agentId
            await this.redisClient.set(`${RedisKeys.UserRoomId}:${userId}`, roomId);
            await this.redisClient.set(`${RedisKeys.AgentRoomId}:${agentId}`, roomId);
            console.log(`Room ${roomId} created for User ${userId} and Agent ${agentId}`);
            return roomId
        } catch (e) {
            console.log(e)
        }

    }

    async getUserRoom(id: string, type: RedisKeys) {
        try {
            const roomId = await this.redisClient.get(`${type}:${id}`);
            console.log("getUserRoom",{roomId,KEY:`${type}:${id}`})
            if (!roomId){
                return null
            }
            let agentSocketId = ""
            if (type == RedisKeys.UserRoomId) {
                const agentId = roomId.split("-")[1]
                const agentKey = `${RedisKeys.Agent}:${agentId}`;
                agentSocketId = await this.redisClient.hGet(agentKey, RedisKeys.AgentSocketId)
            }else{
                const userId = roomId.split("-")[0]
                const userKey = `${RedisKeys.User}:${userId}`;
                agentSocketId = await this.redisClient.hGet(userKey, RedisKeys.AgentSocketId)
            }
            return {
                agentSocketId, roomId
            };
        } catch (e) {
            console.log(e)
        }
    }
}