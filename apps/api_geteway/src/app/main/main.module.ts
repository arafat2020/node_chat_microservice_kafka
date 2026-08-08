import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { ServerModule } from "./server/server.module";
import { MessageModule } from "./message/message.module";
import { FileModule } from "./file/file.module";
import { ChannelModule } from "./channel/channel.module";

@Module({
    imports: [
        AuthModule,
        ServerModule,
        MessageModule,
        FileModule,
        ChannelModule,
    ],
})
export class MainModule {}