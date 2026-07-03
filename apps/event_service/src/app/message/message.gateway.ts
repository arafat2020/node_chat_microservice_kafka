import { Injectable, Logger } from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { v4 as uuidv4 } from "uuid";
import { Server, WebSocket } from "ws";
import { RedisCacheService } from "../../lib/cache/redis-cache.service";
import { KafkaService } from "../../lib/kafka/kafka.service";
import { firstValueFrom } from "rxjs";
import { OnModuleInit } from "@nestjs/common";

interface ExtendedWebSocket extends WebSocket {
  id?: string;
  serverId?: string;
}

interface ServerExistsResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger(MessageGateway.name);
  private localClients: Map<string, any> = new Map();

  constructor(
    private redisService: RedisCacheService,
    private kafkaService: KafkaService,
  ) {}

  onModuleInit() {
    // Subscribe to Redis broadcasts for cross-instance messaging
    this.redisService.subscribe("ws:broadcast", (packet) => {
      this.broadcastLocal(packet.serverId, packet.payload);
    });

    this.logger.log("Message gateway initialized ✅");
  }

  private async validateServer(serverId: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.kafkaService.send<ServerExistsResponse>("validate.server", {
          serverId,
        }),
      );

      if (!response || !response.success) {
        this.logger.warn(`Server validation failed for ${serverId}`, response);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Server validation error for ${serverId}`, error);
      return false;
    }
  }

  async handleConnection(client: ExtendedWebSocket, ...args: any[]): Promise<any> {
    const serverId = new URLSearchParams((args[0] as any).url.split("?")[1]).get(
      "serverId",
    );

    if (!serverId || typeof serverId !== "string") {
      this.logger.warn(`Rejected connection: missing serverId`);
      client.close();
      return;
    }

    // Validate that the server exists via Kafka RPC
    const serverExists = await this.validateServer(serverId);
    if (!serverExists) {
      this.logger.warn(`Rejected connection: server ${serverId} does not exist`);
      client.close(1000, "Server does not exist");
      return;
    }

    const clientId = uuidv4();
    client.id = clientId;
    client.serverId = serverId;
    this.localClients.set(clientId, client);

    await this.redisService.addClient(clientId, {
      serverId,
      connectedAt: new Date().toISOString(),
    });

    const count = await this.redisService.getClientCount();
    this.logger.debug(
      `Client ${clientId} connected to server ${serverId}. Total: ${count}`,
    );

    // Send welcome message to the client
    client.send(
      JSON.stringify({
        event: "connection:success",
        clientId,
        serverId,
        message: "Connected to message gateway",
      }),
    );
  }

  async handleDisconnect(client: any): Promise<any> {
    if (client.id) {
      this.localClients.delete(client.id);
      await this.redisService.removeClient(client.id);

      const count = await this.redisService.getClientCount();
      this.logger.debug(
        `Client disconnected: ${client.id}. Total clients: ${count}`,
      );
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
