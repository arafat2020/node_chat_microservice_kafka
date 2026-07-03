import { Module } from "@nestjs/common";
import { FileModule } from "./file/file.module";

@Module({
  imports: [FileModule]
})
export class MainModule {}