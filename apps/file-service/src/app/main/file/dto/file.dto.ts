import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum FileCategoryDto {
  AVATAR = 'AVATAR',
  SERVER_ICON = 'SERVER_ICON',
  CHAT_ATTACHMENT = 'CHAT_ATTACHMENT',
  GENERAL = 'GENERAL',
}

export class CreateFileInstanceDto {
  @ApiProperty({
    description: 'Unique file ID',
  })
  @IsString()
  @IsNotEmpty()
  fileId: string;

  @ApiProperty({
    description: 'Original file name',
    example: 'avatar.png',
  })
  @IsString()
  @IsNotEmpty()
  originalName: string;

  @ApiProperty({
    description: 'S3/MinIO object key for the file',
    example: 'avatars/user-123/avatar.png',
  })
  @IsString()
  @IsNotEmpty()
  s3Key: string;

  @ApiProperty({
    description: 'S3/MinIO URL of the file',
  })
  @IsString()
  @IsNotEmpty()
  s3Url: string;

  @ApiProperty({
    description: 'Category of file',
    enum: FileCategoryDto,
    default: FileCategoryDto.CHAT_ATTACHMENT,
  })
  @IsEnum(FileCategoryDto)
  @IsOptional()
  category?: FileCategoryDto;

  @ApiProperty({
    description: 'Message ID associated with this file (optional)',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  messageId?: string;

  @ApiProperty({
    description: 'Server ID where file is used (optional)',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  serverId?: string;

  @ApiProperty({
    description: 'Channel ID where file is used (optional)',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  channelId?: string;

  @ApiProperty({
    description: 'File size in bytes',
  })
  @IsNumber()
  @IsNotEmpty()
  fileSize: number;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'image/png',
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
