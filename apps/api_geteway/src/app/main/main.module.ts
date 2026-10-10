import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { ServerModule } from "./server/server.module";

@Module({
    imports: [
        AuthModule,
        ServerModule
    ],
})
export class MainModule {}