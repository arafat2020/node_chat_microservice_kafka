import { Module } from "@nestjs/common";
import { MetaService } from "./services/meta.service";
import { ServeService } from "./services/serve.service";
import { S3Service } from "./services/s3.service";
import { FileController } from "./file.controller";

@Module({
    providers: [
        MetaService,
        ServeService,
        S3Service,
    ],
    controllers: [FileController],
})
export class FileModule {}