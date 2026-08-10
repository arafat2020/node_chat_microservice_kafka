import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { KafkaService } from '../../lib/kafka.service';
import {
  AuthMetaData,
  CreateServerDto,
  DeleteServerServiceDto,
  GetInvolveServerDto,
  GetServerDto,
  LeaveServerDto,
  UpdateServerDto,
} from '@node-chat/shared';
import { HTTP_Guard } from '../../guard/microservice-auth-two.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { kafkaRequest } from '../../utils/kafkaRequest';

@ApiTags('server')
@Controller('server')
export class ServerController {
  constructor(private readonly kafkaService: KafkaService) {}

  @Post('create')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
  async createServer(
    @Body() rawData: CreateServerDto,
    @Req() req: Request & { user: AuthMetaData }
  ) {
    rawData.userId = req.user.sub;
    return kafkaRequest(this.kafkaService, 'create.server', rawData);
  }

  @Post('delete')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
  async deleteServer(
    @Body() rawData: DeleteServerServiceDto,
    @Req() req: Request & { user: AuthMetaData }
  ) {
    rawData.userId = req.user.sub;
    return kafkaRequest(this.kafkaService, 'delete.server', rawData);
  }

  @Post('update')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
  async updateServer(
    @Body() rawData: UpdateServerDto,
    @Req() req: Request & { user: AuthMetaData }
  ) {
    return kafkaRequest(this.kafkaService, 'update.server', rawData);
  }

  @Post('get')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
  async getServer(@Body() rawData: GetServerDto) {
    return kafkaRequest(this.kafkaService, 'get.server', rawData);
  }

  @Post('user-servers')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
  async getInvolvedServer(
    @Body() rawData: GetInvolveServerDto,
    @Req() req: Request & { user: AuthMetaData }
  ) {
    rawData.id = req.user.sub;
    return kafkaRequest(this.kafkaService, 'get.involved.server', rawData);
  }

  @Post('leave')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
  async leaveServer(
    @Body() rawData: LeaveServerDto,
    @Req() req: Request & { user: AuthMetaData }
  ) {
    rawData.userId = req.user.sub;
    return kafkaRequest(this.kafkaService, 'leave.server', rawData);
  }
}
