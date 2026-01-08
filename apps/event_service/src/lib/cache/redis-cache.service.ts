import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import Redis from 'ioredis';

/**
 * Service for managing Redis cache operations, including client management,
 * pub/sub messaging, and general key-value storage for the event service.
 */
@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
    private redisClient: Redis;
    private redisSub: Redis;
    private redisPub: Redis;
    private logger = new Logger(RedisCacheService.name);

    /**
     * Initializes Redis connections when the module starts.
     * Sets up the main client for general operations, and separate connections
     * for publish/subscribe functionality to avoid blocking the main client.
     */
    async onModuleInit() {
        try {
            this.redisClient = new Redis({
                host: 'localhost',
                port: 6379,
            });

            // Separate connections for pub/sub
            this.redisSub = new Redis({
                host: 'localhost',
                port: 6379,
            });

            this.redisPub = new Redis({
                host: 'localhost',
                port: 6379,
            });
            this.logger.verbose('Redis connected');
        } catch (error) {
            this.logger.error('Error connecting to Redis', error);
        }

    }

    /**
     * Closes all Redis connections gracefully when the module is destroyed.
     * Ensures proper cleanup of resources to prevent connection leaks.
     */
    async onModuleDestroy() {
        await this.redisClient.quit();
        await this.redisSub.quit();
        await this.redisPub.quit();
    }

    /**
     * Adds a WebSocket client to the Redis store.
     * Stores client data in a hash and adds the client ID to a set for tracking.
     * @param clientId - The unique identifier for the WebSocket client.
     * @param data - The associated data for the client (e.g., user info, connection details).
     */
    async addClient(clientId: string, data: { serverId: string; connectedAt: string }) {
        await this.redisClient.multi()
            .hset('ws:clients', clientId, JSON.stringify(data))
            .sadd('ws:client-ids', clientId)
            .sadd(`ws:server:${data.serverId}`, clientId)
            .exec();
    }

    /**
     * Removes a WebSocket client from the Redis store.
     * Deletes client data from the hash and removes the client ID from the tracking set.
     * @param clientId - The unique identifier for the WebSocket client to remove.
     */
    async removeClient(clientId: string) {
        const raw = await this.redisClient.hget('ws:clients', clientId);
        if (!raw) return;

        const data = JSON.parse(raw);

        await this.redisClient.multi()
            .hdel('ws:clients', clientId)
            .srem('ws:client-ids', clientId)
            .srem(`ws:server:${data.serverId}`, clientId)
            .exec();
    }

    /**
     * Retrieves data for a specific WebSocket client.
     * @param clientId - The unique identifier for the WebSocket client.
     * @returns The client data if found, otherwise null.
     */
    async getClient(clientId: string): Promise<any> {
        const data = await this.redisClient.hget('ws:clients', clientId);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Retrieves all WebSocket client IDs currently stored.
     * @returns An array of all client IDs.
     */
    async getAllClientIds(): Promise<string[]> {
        return await this.redisClient.smembers('ws:client-ids');
    }

    /**
     * Gets the total count of WebSocket clients currently connected.
     * @returns The number of clients.
     */
    async getClientCount(): Promise<number> {
        return await this.redisClient.scard('ws:client-ids');
    }

    /**
     * Publishes a message to a Redis channel.
     * Useful for broadcasting messages across multiple instances of the service.
     * @param channel - The Redis channel to publish to.
     * @param message - The message payload to publish.
     */
    async publish(channel: string, message: any): Promise<void> {
        await this.redisPub.publish(channel, JSON.stringify(message));
    }

    /**
     * Subscribes to a Redis channel and sets up a callback for incoming messages.
     * Note: This method sets up a persistent subscription.
     * @param channel - The Redis channel to subscribe to.
     * @param callback - The function to call when a message is received on the channel.
     */
    subscribe(channel: string, callback: (message: any) => void): void {
        this.redisSub.subscribe(channel);
        this.redisSub.on('message', (ch, msg) => {
            if (ch === channel) {
                callback(JSON.parse(msg));
            }
        });
    }

    /**
     * Sets a key-value pair in Redis with optional time-to-live (TTL).
     * @param key - The key to set.
     * @param value - The value to store (will be JSON serialized).
     * @param ttlSeconds - Optional TTL in seconds. If provided, the key will expire after this time.
     */
    async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
        const data = JSON.stringify(value);
        if (ttlSeconds) {
            await this.redisClient.setex(key, ttlSeconds, data);
        } else {
            await this.redisClient.set(key, data);
        }
    }

    /**
     * Retrieves a value from Redis by key.
     * @param key - The key to retrieve.
     * @returns The parsed value if found, otherwise null.
     */
    async get(key: string): Promise<any> {
        const data = await this.redisClient.get(key);
        return data ? JSON.parse(data) : null;
    }
}