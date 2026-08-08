import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
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

interface ExtendedWebSocket extends WebSocket {
  id?: string;
  serverId?: string;
  userId?: string;
}

interface ServerExistsResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

interface TokenVerifyResponse {
  success?: boolean;
  message?: string;
  data?: {
    sub?: string;
    email?: string;
  };
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
  private localClients: Map<string, ExtendedWebSocket> = new Map();

  constructor(
    private redisService: RedisCacheService,
    private kafkaService: KafkaService,
  ) {}

  onModuleInit() {
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

  private async verifyToken(token: string): Promise<{ sub?: string } | null> {
    try {
      const response = await firstValueFrom(
        this.kafkaService.send<TokenVerifyResponse>("user.verifyToken", token),
      );

      if (!response || !response.success || !response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      this.logger.error("Token verification failed over Kafka RPC", error);
      return null;
    }
  }

  async handleConnection(client: ExtendedWebSocket, ...args: any[]): Promise<any> {
    const urlParams = new URLSearchParams((args[0] as any).url.split("?")[1]);
    const serverId = urlParams.get("serverId");
    const token = urlParams.get("token");

    if (!serverId || typeof serverId !== "string") {
      this.logger.warn(`Rejected connection: missing serverId`);
      client.close(1008, "Missing serverId");
      return;
    }

    // Optional token verification if provided
    let userId: string | undefined = undefined;
    if (token) {
      const authUser = await this.verifyToken(token);
      if (!authUser || !authUser.sub) {
        this.logger.warn(`Rejected connection: invalid JWT token`);
        client.close(1008, "Invalid authentication token");
        return;
      }
      userId = authUser.sub;
    }

    const serverExists = await this.validateServer(serverId);
    if (!serverExists) {
      this.logger.warn(`Rejected connection: server ${serverId} does not exist`);
      client.close(1000, "Server does not exist");
      return;
    }

    const clientId = uuidv4();
    client.id = clientId;
    client.serverId = serverId;
    client.userId = userId;
    this.localClients.set(clientId, client);

    await this.redisService.addClient(clientId, {
      serverId,
      connectedAt: new Date().toISOString(),
    });

    const count = await this.redisService.getClientCount();
    this.logger.debug(
      `Client ${clientId} (User: ${userId || 'anonymous'}) connected to server ${serverId}. Total: ${count}`,
    );

    client.send(
      JSON.stringify({
        event: "connection:success",
        clientId,
        serverId,
        userId,
        message: "Connected to real-time message gateway",
      }),
    );
  }

  async handleDisconnect(client: ExtendedWebSocket): Promise<any> {
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
