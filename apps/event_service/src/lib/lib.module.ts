import { Global, Module } from "@nestjs/common";
import { RedisCacheService } from "./cache/redis-cache.service";

@Global()
@Module({
    providers:[RedisCacheService],
    exports:[RedisCacheService],
})
export class LibModule{}