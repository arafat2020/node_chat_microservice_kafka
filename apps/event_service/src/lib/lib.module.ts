import { Global, Module } from "@nestjs/common";
import { RedisCacheService } from "./cache/redis-cache.service";
import { KafkaModule } from "./kafka/kafka.module";

@Global()
@Module({
    imports: [KafkaModule],
    providers:[RedisCacheService],
    exports:[RedisCacheService, KafkaModule],
})
export class LibModule{}