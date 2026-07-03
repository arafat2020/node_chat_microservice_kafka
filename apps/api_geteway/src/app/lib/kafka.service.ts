import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);

  constructor(@Inject('KAFKA_CLIENT') private readonly client: ClientKafka) {}

  async onModuleInit() {
    this.logger.debug('Connecting Kafka client...');
    // Auth topics
    this.client.subscribeToResponseOf('user.signin');
    this.client.subscribeToResponseOf('user.signup');
    this.client.subscribeToResponseOf('user.verifyToken');
    // Server topics
    this.client.subscribeToResponseOf('create.server');
    this.client.subscribeToResponseOf('delete.server');
    // Message topics
    this.client.subscribeToResponseOf('create.message');
    this.client.subscribeToResponseOf('get.message');
    this.client.subscribeToResponseOf('list.message');
    this.client.subscribeToResponseOf('update.message');
    this.client.subscribeToResponseOf('delete.message');
    // File topics
    this.client.subscribeToResponseOf('upload.file');
    this.client.subscribeToResponseOf('download.file');
    this.client.subscribeToResponseOf('delete.file');
    this.client.subscribeToResponseOf('get.file.metadata');
    await this.client.connect();
    this.logger.log('Kafka client connected ✅');
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting Kafka client...');
    await this.client.close();
    this.logger.log('Kafka client disconnected ❌');
  }

  // Request-response
 send<T = any>(topic: string, message: any) {
  this.logger.debug(`Sending message to topic "${topic}"`, message);
  return this.client.send<T, any>(topic, message); // remove async
}

  // Fire-and-forget
  async emit(topic: string, message: any) {
    this.logger.debug(`Emitting event to topic "${topic}"`, message);
    return this.client.emit<any>(topic, message);
  }

  // Subscribe to reply topics (only needed for RPC-style)
  subscribeToResponseOf(topic: string) {
    this.logger.log(`Subscribing to response of topic "${topic}"`);
    this.client.subscribeToResponseOf(topic);
  }
}
