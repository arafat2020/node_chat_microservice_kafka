import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { kafkaRequest } from '../../utils/kafkaRequest';
import { KafkaService } from '../../lib/kafka.service';
import { HTTP_Guard } from '../../guard/microservice-auth-two.guard';
import { AuthMetaData } from '@node-chat/shared';

@ApiTags('file')
@Controller('file')
export class FileController {
  constructor(private readonly kafkaService: KafkaService) {}

  @Post('presigned-upload-url')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
  @ApiOperation({ summary: 'Generate a presigned upload URL for direct upload to MinIO/S3' })
  async getPresignedUploadUrl(
    @Body()
    rawData: {
      fileKey: string;
      contentType: string;
      expiresIn?: number;
    },
  ) {
    return kafkaRequest(this.kafkaService, 'get.presigned.upload.url', rawData);
  }

  @Post('save-metadata')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
  @ApiOperation({ summary: 'Save file metadata after successful upload' })
  async saveFileMetadata(
    @Body() rawData: any,
    @Req() req: Request & { user: AuthMetaData },
  ) {
    rawData.uploadedBy = req.user.sub;
    return kafkaRequest(this.kafkaService, 'save.file.metadata', rawData);
  }

  @Post('upload')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
  @ApiOperation({ summary: 'Upload file directly via microservice buffer' })
  async uploadFile(
    @Body()
    rawData: {
      fileKey: string;
      fileBuffer: Buffer;
      contentType: string;
      fileId: string;
      originalName: string;
      messageId?: string;
      serverId?: string;
      channelId?: string;
      uploadedBy?: string;
    },
    @Req() req: Request & { user: AuthMetaData },
  ) {
    rawData.uploadedBy = req.user.sub;
    return kafkaRequest(this.kafkaService, 'upload.file', rawData);
  }

  @Post('download')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
  @ApiOperation({ summary: 'Get presigned download URL for a file' })
  async downloadFile(
    @Body()
    rawData: {
      fileKey: string;
      expiresIn?: number;
    },
  ) {
    return kafkaRequest(this.kafkaService, 'download.file', rawData);
  }

  @Post('delete')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
  @ApiOperation({ summary: 'Delete file from MinIO/S3' })
  async deleteFile(@Body() rawData: { fileKey: string }) {
    return kafkaRequest(this.kafkaService, 'delete.file', rawData);
  }

  @Post('metadata')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
  @ApiOperation({ summary: 'Get file metadata by messageId' })
  async getFileMetadata(@Body() rawData: { messageId: string }) {
    return kafkaRequest(this.kafkaService, 'get.file.metadata', rawData);
  }
}
