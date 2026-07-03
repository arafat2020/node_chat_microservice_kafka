import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { ServerModule } from "./server/server.module";
import { MessageModule } from "./message/message.module";

@Module({
    imports: [
        AuthModule,
        ServerModule,
        MessageModule,
    ],
})
export class MainModule {}