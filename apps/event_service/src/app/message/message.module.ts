import { Module } from "@nestjs/common";
import { MessageGateway } from "./message.gateway";
import { MessageEventController } from "./message.event.controller";

@Module({
    providers:[MessageGateway],
    controllers:[MessageEventController],
})
export class MessageModule {}