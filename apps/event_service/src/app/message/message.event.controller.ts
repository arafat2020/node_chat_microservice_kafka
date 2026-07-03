import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessageGateway } from './message.gateway';
import { Logger } from '@nestjs/common';

@Controller()
export class MessageEventController {
  private readonly logger = new Logger(MessageEventController.name);

  constructor(private readonly messageGateway: MessageGateway) {}

  @MessagePattern('message:created')
  async handleMessageCreated(data: {
    serverId: string;
    channelId: string;
    payload: any;
  }) {
    this.logger.debug('Received message:created event', data);
    // Broadcast to all connected WebSocket clients for this server
    this.messageGateway.broadcastLocal(data.serverId, {
      event: 'message:created',
      channel: data.channelId,
      data: data.payload,
    });
    return { success: true };
  }
}
