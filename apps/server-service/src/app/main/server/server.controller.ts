import { Controller } from '@nestjs/common';
import { CreateServerService } from './service/create-server.service';
import { DeleteServerService } from './service/delete-server.service';
import { MessagePattern } from '@nestjs/microservices';
import {
  CreateServerDto,
  DeleteServerServiceDto,
  GetInvolveServerDto,
  GetServerDto,
  IsServerExistsDto,
  LeaveServerDto,
  UpdateServerDto,
} from '@node-chat/shared';
import { UpdateServerService } from './service/update-server.service';
import { GetServerService } from './service/getServer.service';
import { GetInvolvedServerService } from './service/get-involved-server.service';
import { LeaveServerService } from './service/leave-server.service';
import { QueryService } from './service/query.service';

@Controller('server')
export class ServerController {
  constructor(
    private readonly createServerService: CreateServerService,
    private readonly deleteServerService: DeleteServerService,
    private readonly updateServerService: UpdateServerService,
    private readonly getServerService: GetServerService,
    private readonly getInvolvedServerService: GetInvolvedServerService,
    private readonly leaveServerService: LeaveServerService,
    private readonly queryService: QueryService
  ) {}

  @MessagePattern('create.server')
  async createServer(data: CreateServerDto) {
    return this.createServerService.createServer(data);
  }

  @MessagePattern('delete.server')
  async deleteServer(data: DeleteServerServiceDto) {
    return this.deleteServerService.deleteServer(data);
  }

  @MessagePattern('update.server')
  async updateServer(data: UpdateServerDto) {
    return this.updateServerService.update(data);
  }

  @MessagePattern('get.server')
  async getServer(data: GetServerDto) {
    return this.getServerService.get(data);
  }

  @MessagePattern('get.involved.server')
  async getInvolvedServer(data: GetInvolveServerDto) {
    return this.getInvolvedServerService.get(data);
  }

  @MessagePattern('leave.server')
  async leaveServer(data: LeaveServerDto) {
    return this.leaveServerService.leaveServer(data);
  }

  @MessagePattern('is.server.exists')
  async isServerExists(data: IsServerExistsDto) {
    return this.queryService.isServerExists(data);
  }

  @MessagePattern('validate.server')
  async validateServer(data: { serverId: string }) {
    return this.queryService.validateServer(data.serverId);
  }

}