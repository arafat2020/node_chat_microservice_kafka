import { Injectable, Logger } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { v4 as uuidv4 } from 'uuid';
import { Server, WebSocket } from 'ws';
import { RedisCacheService } from "../../lib/cache/redis-cache.service";

interface ExtendedWebSocket extends WebSocket {
    id?: string;
    serverId?: string;
}

import { OnModuleInit } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
    cors: {
        origin: '*',
    }
})
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    @WebSocketServer()
    server: Server;

    private logger = new Logger(MessageGateway.name);
    private localClients: Map<string, any> = new Map();


    constructor(private redisService: RedisCacheService) { }

    onModuleInit() {
        this.redisService.subscribe('ws:broadcast', (packet) => {
            this.broadcastLocal(packet.serverId, packet.payload);
        });
    }

    async handleConnection(client: ExtendedWebSocket, ...args: any[]): Promise<any> {

        const serverId = new URLSearchParams((args[0] as any).url.split('?')[1]).get('serverId');


        if (!serverId || typeof serverId !== 'string') {
            this.logger.warn(`Rejected connection: missing serverId`);
            client.close();
            return;
        }

        const clientId = uuidv4();
        client.id = clientId;
        client.serverId = serverId;
        this.localClients.set(clientId, client);   // ✔ Correct

        await this.redisService.addClient(clientId, {
            serverId,
            connectedAt: new Date().toISOString(),
        });

        const count = await this.redisService.getClientCount();
        this.logger.debug(`Client ${clientId} connected to ${serverId}. Total: ${count}`);
    }


    async handleDisconnect(client: any): Promise<any> {

        if (client.id) {
            this.localClients.delete(client.id);
            await this.redisService.removeClient(client.id);

            const count = await this.redisService.getClientCount();
            this.logger.debug(`Client disconnected: ${client.id}. Total clients: ${count}`);
        }
    }

    public broadcastLocal(serverId: string, payload: any) {
        for (const client of this.localClients.values()) {
            if (client.serverId === serverId && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(payload));
            }
        }
    }

}