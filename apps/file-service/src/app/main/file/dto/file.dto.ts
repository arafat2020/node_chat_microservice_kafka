import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsEnum, IsNotEmpty } from 'class-validator';
import { FileType } from '../../../../generated/prisma';

export class CreateFileInstanceDto {
  @ApiProperty({
    description: 'Unique identifier of the file (usually an internal ID)',
    example: 'file_3f2b12a8-4ad9-4b5f-a9de-f234cd567890',
  })
  @IsString()
  @IsNotEmpty()
  fileId: string;

  @ApiProperty({
    description: 'Path or key of the file in storage (e.g., S3 key)',
    example: 'uploads/images/2025/10/profile_123.jpg',
  })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty({
    description: 'Bucket name where the file is stored',
    example: 'user-uploads',
  })
  @IsString()
  @IsNotEmpty()
  bucket: string;

  @ApiProperty({
    description: 'Type of the file (e.g., IMAGE, VIDEO, DOCUMENT)',
    enum: FileType,
    example: 'IMAGE',
  })
  @IsEnum(FileType)
  type: FileType;

  @ApiProperty({
    description: 'UUID of the user who uploaded the file',
    example: 'f2f2bba8-8b10-4f8b-8de7-4a1c1f0de123',
  })
  @IsUUID()
  uploadedBy: string;
}
