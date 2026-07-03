import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { kafkaRequest } from '../../utils/kafkaRequest';
import { KafkaService } from '../../lib/kafka.service';
import { HTTP_Guard } from '../../guard/microservice-auth-two.guard';

@Controller('file')
export class FileController {
  constructor(private readonly kafkaService: KafkaService) {}

  @Post('upload')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
  async uploadFile(
    @Body()
    rawData: {
      fileKey: string;
      fileBuffer: Buffer;
      contentType: string;
      messageId: string;
      serverId: string;
      channelId: string;
    },
  ) {
    return kafkaRequest(this.kafkaService, 'upload.file', rawData);
  }

  @Post('download')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
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
  async deleteFile(@Body() rawData: { fileKey: string }) {
    return kafkaRequest(this.kafkaService, 'delete.file', rawData);
  }

  @Post('metadata')
  @ApiBearerAuth()
  @UseGuards(HTTP_Guard)
  async getFileMetadata(@Body() rawData: { messageId: string }) {
    return kafkaRequest(this.kafkaService, 'get.file.metadata', rawData);
  }
}
