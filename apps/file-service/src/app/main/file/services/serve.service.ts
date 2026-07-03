import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { DdbService } from "../../../lib/db/db.service";

@Injectable()
export class ServeService {
  private readonly logger = new Logger(ServeService.name);

  constructor(private readonly dbService: DdbService) {}

  async getFileMetadata(messageId: string) {
    try {
      const metadata = await this.dbService.fileInstance.findFirst({
        where: { messageId },
      });

      if (!metadata) {
        throw new NotFoundException(`No file metadata found for message ${messageId}`);
      }

      this.logger.log(`Retrieved file metadata for message ${messageId}`);
      return metadata;
    } catch (error) {
      this.logger.error(`Failed to get file metadata: ${String(error)}`);
      throw error;
    }
  }
}
