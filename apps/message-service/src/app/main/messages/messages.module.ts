import { Module } from '@nestjs/common';
import { MessageController } from './messages.controller';
import { MessageService } from './services/create-message.service';

@Module({
  imports: [],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessagesModule {}
