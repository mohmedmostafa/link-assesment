import {RedisKeys} from "../../consts/redis-keys";

class UserRoomHandler {
    constructor(private redisClient: any) {}

    async getRoomData(userId: string) {
        const roomId = await this.redisClient.hGet(`${RedisKeys.User}:${userId}`, `${RedisKeys.UserRoomId}:${userId}`);
        console.log("RoomHandler", { roomId, KEY: `${RedisKeys.User}:${userId}` });

        if (!roomId) return null;

        const agentId = roomId.split("-")[1];
        const agentSocketId = await this.redisClient.hGet(`${RedisKeys.Agent}:${agentId}`, RedisKeys.AgentSocketId);

        return { agentSocketId, roomId };
    }
}

class AgentRoomHandler {
    constructor(private redisClient: any) {}

    async getRoomData(agentId: string) {
        const roomId = await this.redisClient.hGet(`${RedisKeys.Agent}:${agentId}`, `${RedisKeys.AgentRoomId}:${agentId}`);
        console.log("AgentRoomHandler", { roomId, KEY: `${RedisKeys.Agent}:${agentId}` });

        if (!roomId) return null;

        const userId = roomId.split("-")[0];
        const agentSocketId = await this.redisClient.hGet(`${RedisKeys.User}:${userId}`, RedisKeys.AgentSocketId);

        return { agentSocketId, roomId };
    }
}



export class RoomHandlerFactory {
    constructor(private redisClient: any) {}

    getHandler(type: RedisKeys) {
        switch (type) {
            case RedisKeys.User:
                return new UserRoomHandler(this.redisClient);
            case RedisKeys.Agent:
                return new AgentRoomHandler(this.redisClient);
            default:
                throw new Error("Invalid RedisKey type");
        }
    }
}
