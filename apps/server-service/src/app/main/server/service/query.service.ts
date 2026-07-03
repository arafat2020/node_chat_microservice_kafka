import { BadRequestException, Injectable } from '@nestjs/common';
import { DdbService } from '../../../lib/db/db.service';
import {
  IsServerExistsDto,
  PromiseMapResponseGeneric,
} from '@node-chat/shared';

@Injectable()
export class QueryService {
  constructor(private readonly dbService: DdbService) {}

  public async isServerExists({
    channelId,
    serverId,
  }: IsServerExistsDto): PromiseMapResponseGeneric<unknown> {
    try {
      const data = await this.dbService.server.findFirst({
        where: {
          id: serverId,
          channels: {
            some: {
              id: channelId,
            },
          },
        },
      });
      return {
        data,
        message: 'Successfully fetched Server existence',
        success: true,
      };
    } catch (error) {
      throw new BadRequestException(
        'Failed to update server \n`' + String(error)
      );
    }
  }

  public async validateServer(serverId: string): PromiseMapResponseGeneric<unknown> {
    try {
      const data = await this.dbService.server.findUnique({
        where: { id: serverId },
        select: { id: true, name: true },
      });

      if (!data) {
        return {
          data: null,
          message: 'Server not found',
          success: false,
        };
      }

      return {
        data,
        message: 'Server exists',
        success: true,
      };
    } catch (error) {
      throw new BadRequestException('Failed to validate server: ' + String(error));
    }
  }

