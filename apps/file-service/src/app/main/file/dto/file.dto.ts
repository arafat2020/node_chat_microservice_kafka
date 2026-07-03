import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateFileInstanceDto {
  @ApiProperty({
    description: 'Original file name',
    example: 'document.pdf',
  })
  @IsString()
  @IsNotEmpty()
  originalName: string;

  @ApiProperty({
    description: 'S3 key for the uploaded file',
    example: 'files/uuid/document.pdf',
  })
  @IsString()
  @IsNotEmpty()
  s3Key: string;

  @ApiProperty({
    description: 'S3 URL of the file',
    example: 's3://bucket/files/uuid/document.pdf',
  })
  @IsString()
  @IsNotEmpty()
  s3Url: string;

  @ApiProperty({
    description: 'Message ID associated with this file',
  })
  @IsUUID()
  @IsNotEmpty()
  messageId: string;

  @ApiProperty({
    description: 'Server ID where file is used',
  })
  @IsUUID()
  @IsNotEmpty()
  serverId: string;

  @ApiProperty({
    description: 'Channel ID where file is used',
  })
  @IsUUID()
  @IsNotEmpty()
  channelId: string;

  @ApiProperty({
    description: 'File size in bytes',
  })
  @IsNumber()
  @IsNotEmpty()
  fileSize: number;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf',
  })
  @IsString()
  @IsNotEmpty()
  contentType: string;

  @ApiProperty({
    description: 'User ID who uploaded the file (optional)',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  uploadedBy?: string;
}

