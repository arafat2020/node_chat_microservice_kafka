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
}
