import { Module } from "@nestjs/common";
import { MetaService } from "./services/meta.service";
import { ServeService } from "./services/serve.service";

@Module({
    providers: [
        MetaService,
        ServeService
    ],
})
export class FileModule {}