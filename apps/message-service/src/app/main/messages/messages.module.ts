import { Module } from '@nestjs/common';
import { CreateMessageService } from './services/create-message.service';

@Module({
  providers: [CreateMessageService],
})
export class MessagesModule {}
