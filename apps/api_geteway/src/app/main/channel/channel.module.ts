import { Module } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { LibModule } from '../../lib/lib.module';

@Module({
  imports: [LibModule],
  controllers: [ChannelController],
})
export class ChannelModule {}
