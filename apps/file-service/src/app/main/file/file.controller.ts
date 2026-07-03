import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MetaService } from './services/meta.service';
import { ServeService } from './services/serve.service';
import { S3Service } from './services/s3.service';

@Controller()
export class FileController {
  private readonly logger = new Logger(FileController.name);

  constructor(
    private readonly metaService: MetaService,
    private readonly serveService: ServeService,
    private readonly s3Service: S3Service,
  ) {}

  @MessagePattern('upload.file')
  async uploadFile(data: {
    fileKey: string;
    fileBuffer: Buffer;
    contentType: string;
    messageId: string;
    serverId: string;
    channelId: string;
  }) {
    this.logger.debug('Received upload.file event', data);
    try {
      // Upload to S3
      const s3Result = await this.s3Service.uploadFile(
        data.fileKey,
        data.fileBuffer,
        data.contentType,
      );

      // Save metadata to database
      const metadata = await this.metaService.saveFileMetadata({
        originalName: data.fileKey,
        s3Key: s3Result.key,
        s3Url: s3Result.url,
        messageId: data.messageId,
        serverId: data.serverId,
        channelId: data.channelId,
        fileSize: data.fileBuffer.length,
        contentType: data.contentType,
      });

      return {
        success: true,
        data: metadata.data,
        message: 'File uploaded successfully',
      };
    } catch (error) {
      this.logger.error('Upload failed:', error);
      return {
        success: false,
        message: `Upload failed: ${String(error)}`,
      };
    }
  }

  @MessagePattern('download.file')
  async downloadFile(data: { fileKey: string; expiresIn?: number }) {
    this.logger.debug('Received download.file event', data);
    try {
      const downloadUrl = await this.s3Service.getDownloadUrl(
        data.fileKey,
        data.expiresIn || 3600,
      );

      return {
        success: true,
        downloadUrl,
        message: 'Download URL generated successfully',
      };
    } catch (error) {
      this.logger.error('Download URL generation failed:', error);
      return {
        success: false,
        message: `Failed to generate download URL: ${String(error)}`,
      };
    }
  }

  @MessagePattern('delete.file')
  async deleteFile(data: { fileKey: string }) {
    this.logger.debug('Received delete.file event', data);
    try {
      await this.s3Service.deleteFile(data.fileKey);

      return {
        success: true,
        message: 'File deleted successfully',
      };
    } catch (error) {
      this.logger.error('Delete failed:', error);
      return {
        success: false,
        message: `Delete failed: ${String(error)}`,
      };
    }
  }

  @MessagePattern('get.file.metadata')
  async getFileMetadata(data: { messageId: string }) {
    this.logger.debug('Received get.file.metadata event', data);
    try {
      const metadata = await this.serveService.getFileMetadata(data.messageId);

      return {
        success: true,
        data: metadata,
        message: 'File metadata retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Get metadata failed:', error);
      return {
        success: false,
        message: `Failed to retrieve metadata: ${String(error)}`,
      };
    }
  }
}
