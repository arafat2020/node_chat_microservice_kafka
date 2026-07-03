import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { kafkaRequest } from '../../utils/kafkaRequest';
import { KafkaService } from '../../lib/kafka.service';
import { HTTP_Guard } from '../../guard/microservice-auth-two.guard';
import { AuthMetaData, CreateMessageDto } from '@node-chat/shared';

@Controller('message')
export class MessageController {
  constructor(private readonly kafkaService: KafkaService) {}

  @Post('create')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
  async createMessage(
    @Body() rawData: CreateMessageDto,
    @Req() req: Request & { user: AuthMetaData },
  ) {
    rawData.senderId = req.user.sub;
    return kafkaRequest(this.kafkaService, 'create.message', rawData);
  }

  @Post('get')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
  async getMessage(@Body() rawData: { messageId: string }) {
    return kafkaRequest(this.kafkaService, 'get.message', rawData);
  }

  @Post('list')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
  async listMessages(
    @Body()
    rawData: {
      serverId?: string;
      channelId?: string;
      senderId?: string;
    },
  ) {
    return kafkaRequest(this.kafkaService, 'list.message', rawData);
  }

  @Post('update')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
  async updateMessage(@Body() rawData: any) {
    return kafkaRequest(this.kafkaService, 'update.message', rawData);
  }

  @Post('delete')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
  async deleteMessage(@Body() rawData: { messageId: string }) {
    return kafkaRequest(this.kafkaService, 'delete.message', rawData);
  }
}
