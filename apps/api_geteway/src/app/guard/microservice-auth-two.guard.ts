import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { KafkaService } from '../lib/kafka.service';
import { AuthResponse } from '@node-chat/shared';
import { kafkaRequest } from '../utils/kafkaRequest';

@Injectable()
export class HTTP_Guard implements CanActivate {
  private readonly verifyTopic = 'user.verifyToken';
  constructor(private readonly kafkaClient: KafkaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest();

    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : null;

    if (!token) {
      throw new UnauthorizedException('Missing token in Authorization header');
    }

    try {
      const response: AuthResponse = await kafkaRequest(this.kafkaClient, this.verifyTopic, token);

      if (!response.success) {
        throw new UnauthorizedException(response.message || 'Invalid token');
      }

      // ✅ Attach user data to request
      (req as any).user = response.data;

      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
          ? error
          : 'Token verification failed';

      throw new UnauthorizedException(message);
    }
  }
}
