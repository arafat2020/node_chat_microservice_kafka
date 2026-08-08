import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessageGateway } from './message.gateway';

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
    this.messageGateway.broadcastLocal(data.serverId, {
      event: 'message:created',
      channel: data.channelId,
      data: data.payload,
    });
    return { success: true };
  }

  @MessagePattern('message:updated')
  async handleMessageUpdated(data: {
    serverId: string;
    channelId: string;
    payload: any;
  }) {
    this.logger.debug('Received message:updated event', data);
    this.messageGateway.broadcastLocal(data.serverId, {
      event: 'message:updated',
      channel: data.channelId,
      data: data.payload,
    });
    return { success: true };
  }

  @MessagePattern('message:deleted')
  async handleMessageDeleted(data: {
    serverId: string;
    channelId: string;
    messageId: string;
  }) {
    this.logger.debug('Received message:deleted event', data);
    this.messageGateway.broadcastLocal(data.serverId, {
      event: 'message:deleted',
      channel: data.channelId,
      messageId: data.messageId,
    });
    return { success: true };
  }

  @MessagePattern('user:typing')
  async handleUserTyping(data: {
    serverId: string;
    channelId: string;
    userId: string;
    isTyping: boolean;
  }) {
    this.messageGateway.broadcastLocal(data.serverId, {
      event: 'user:typing',
      channel: data.channelId,
      userId: data.userId,
      isTyping: data.isTyping,
    });
    return { success: true };
  }
}
