import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessageService } from './services/create-message.service';

@Controller()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @MessagePattern('create.message')
  async createMessage(data: any) {
    return this.messageService.create(data);
  }

  @MessagePattern('get.message')
  async getMessage(data: { messageId: string }) {
    return this.messageService.findOne(data.messageId);
  }

  @MessagePattern('list.message')
  async listMessages(data: { serverId?: string; channelId?: string; senderId?: string }) {
    return this.messageService.findAll(data);
  }

  @MessagePattern('update.message')
  async updateMessage(data: any) {
    return this.messageService.update(data);
  }

  @MessagePattern('delete.message')
  async deleteMessage(data: { messageId: string }) {
    return this.messageService.delete(data.messageId);
  }
}
