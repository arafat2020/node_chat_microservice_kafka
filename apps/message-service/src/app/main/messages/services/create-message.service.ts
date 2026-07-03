import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { DbService } from '../../../lib/db/db.service';
import { KafkaService } from '../../../lib/kafka/kafka.service';
import { CreateMessageDto, PromiseMapResponseGeneric } from '@node-chat/shared';

type MessageCreateInput = {
  content?: string;
  fileUrl?: string;
  channelId: string;
  senderId: string;
  serverId: string;
};

type MessageUpdateInput = Partial<MessageCreateInput> & {
  messageId: string;
};

type MessageFilterInput = Partial<Pick<MessageCreateInput, 'serverId' | 'channelId' | 'senderId'>>;

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly dbService: DbService,
    private readonly kafkaService: KafkaService,
  ) {}

  private async validateServerAndChannel(serverId: string, channelId: string) {
    if (!serverId || !channelId) {
      throw new BadRequestException('serverId and channelId are required to validate message routing');
    }

    interface ServerExistsResponse {
      success?: boolean;
      message?: string;
      data?: unknown;
    }

    const response = await firstValueFrom(
      this.kafkaService.send<ServerExistsResponse>('is.server.exists', { serverId, channelId }),
    );

    if (!response || !response.success || !response.data) {
      this.logger.warn('Server/channel validation failed', { serverId, channelId, response });
      throw new BadRequestException('Server or channel does not exist');
    }
  }

  public async create(rawData: CreateMessageDto): PromiseMapResponseGeneric<unknown> {
    const payload = rawData as unknown as MessageCreateInput;

    await this.validateServerAndChannel(payload.serverId, payload.channelId);

    try {
      const data = await this.dbService.message.create({
        data: {
          content: payload.content ?? null,
          fileUrl: payload.fileUrl ?? null,
          channelId: payload.channelId,
          senderId: payload.senderId,
          serverId: payload.serverId,
        },
      });

      // Emit message created event to event service via Kafka
      this.kafkaService.emit('message:created', {
        serverId: payload.serverId,
        channelId: payload.channelId,
        payload: data,
      });

      return {
        data,
        message: 'Message created successfully',
        success: true,
      };
    } catch (error) {
      this.logger.error('Create message failed', error);
      throw new BadRequestException('Failed to create message: ' + String(error));
    }
  }

  public async findOne(messageId: string): PromiseMapResponseGeneric<unknown> {
    try {
      const data = await this.dbService.message.findUnique({
        where: { id: messageId },
      });
      return {
        data,
        message: data ? 'Message retrieved successfully' : 'Message not found',
        success: true,
      };
    } catch (error) {
      this.logger.error('Find message failed', error);
      throw new BadRequestException('Failed to retrieve message: ' + String(error));
    }
  }

  public async findAll(filters: MessageFilterInput): PromiseMapResponseGeneric<unknown> {
    try {
      const where: Record<string, unknown> = {};
      if (filters.serverId) where.serverId = filters.serverId;
      if (filters.channelId) where.channelId = filters.channelId;
      if (filters.senderId) where.senderId = filters.senderId;

      const data = await this.dbService.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return {
        data,
        message: 'Messages fetched successfully',
        success: true,
      };
    } catch (error) {
      this.logger.error('List messages failed', error);
      throw new BadRequestException('Failed to list messages: ' + String(error));
    }
  }

  public async update(rawData: MessageUpdateInput): PromiseMapResponseGeneric<unknown> {
    const { messageId, serverId, channelId, ...updateData } = rawData;
    if (!messageId) {
      throw new BadRequestException('messageId is required to update a message');
    }

    const existingMessage = await this.dbService.message.findUnique({
      where: { id: messageId },
    });

    if (!existingMessage) {
      throw new BadRequestException('Message not found');
    }

    const effectiveServerId = serverId ?? existingMessage.serverId;
    const effectiveChannelId = channelId ?? existingMessage.channelId;

    await this.validateServerAndChannel(effectiveServerId, effectiveChannelId);

    try {
      const data = await this.dbService.message.update({
        where: { id: messageId },
        data: {
          ...updateData,
          content: updateData.content ?? undefined,
          fileUrl: updateData.fileUrl ?? undefined,
          serverId: serverId ?? undefined,
          channelId: channelId ?? undefined,
          senderId: updateData.senderId ?? undefined,
        },
      });

      return {
        data,
        message: 'Message updated successfully',
        success: true,
      };
    } catch (error) {
      this.logger.error('Update message failed', error);
      throw new BadRequestException('Failed to update message: ' + String(error));
    }
  }

  public async delete(messageId: string): PromiseMapResponseGeneric<unknown> {
    try {
      const data = await this.dbService.message.delete({
        where: { id: messageId },
      });
      return {
        data,
        message: 'Message deleted successfully',
        success: true,
      };
    } catch (error) {
      this.logger.error('Delete message failed', error);
      throw new BadRequestException('Failed to delete message: ' + String(error));
    }
  }
}
