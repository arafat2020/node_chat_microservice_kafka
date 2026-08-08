import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { kafkaRequest } from '../../utils/kafkaRequest';
import { KafkaService } from '../../lib/kafka.service';
import { HTTP_Guard } from '../../guard/microservice-auth-two.guard';
import {
  CreateChannelDto,
  DeleteChannelDto,
  IdDto,
  UpdateChannelDto,
} from '@node-chat/shared';

@ApiTags('channel')
@Controller('channel')
export class ChannelController {
  constructor(private readonly kafkaService: KafkaService) {}

  @Post('create')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
  async createChannel(@Body() rawData: CreateChannelDto) {
    return kafkaRequest(this.kafkaService, 'channel.create', rawData);
  }

  @Post('update')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
  async updateChannel(@Body() rawData: UpdateChannelDto) {
    return kafkaRequest(this.kafkaService, 'channel.update', rawData);
  }

  @Post('delete')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
  async deleteChannel(@Body() rawData: DeleteChannelDto) {
    return kafkaRequest(this.kafkaService, 'channel.delete', rawData);
  }

  @Post('get')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
  async getChannel(@Body() rawData: IdDto) {
    return kafkaRequest(this.kafkaService, 'channel.get', rawData);
  }
}
