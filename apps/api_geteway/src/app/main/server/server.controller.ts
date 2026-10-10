import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { KafkaService } from '../../lib/kafka.service';
import {
  AuthMetaData,
  CreateServerDto,
  DeleteServerServiceDto,
} from '@node-chat/shared';
import { HTTP_Guard } from '../../guard/microservice-auth-two.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { kafkaRequest } from '../../utils/kafkaRequest';

@Controller()
export class ServerController {
  constructor(private readonly kafkaService: KafkaService) {}

  @Post('create-server')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
  async createServer(
    @Body() rawData: CreateServerDto,
    @Req() req: Request & { user: AuthMetaData }
  ) {
    rawData.userId = req.user.sub;
    return kafkaRequest(this.kafkaService, 'create.server', rawData)
  }

  @Post('delete-server')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
  async deleteServer(
    @Body() rawData: DeleteServerServiceDto,
    @Req() req: Request & { user: AuthMetaData }
) {
    rawData.userId = req.user.sub;
    return kafkaRequest(this.kafkaService, 'delete.server', rawData)
  }
}
