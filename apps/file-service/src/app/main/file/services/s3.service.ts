import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor() {
    const endpoint = process.env.MINIO_ENDPOINT || process.env.AWS_ENDPOINT || "http://localhost:9000";
    const region = process.env.AWS_REGION || "us-east-1";
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.MINIO_ROOT_USER || "minioadmin";
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.MINIO_ROOT_PASSWORD || "minioadmin";

    this.bucket = process.env.AWS_S3_BUCKET || "node-chat-files";

    this.s3Client = new S3Client({
      region,
      endpoint,
      forcePathStyle: true, // Required for MinIO S3 compatibility
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.logger.log(`Initialized S3/MinIO service connected to ${endpoint} (Bucket: ${this.bucket})`);
  }

  async getPresignedUploadUrl(
    fileKey: string,
    contentType: string,
    expiresIn: number = 3600,
  ): Promise<{ uploadUrl: string; key: string; s3Url: string }> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      this.logger.log(`Generated presigned upload URL for: ${fileKey}`);

      return {
        uploadUrl,
        key: fileKey,
        s3Url: `${process.env.MINIO_ENDPOINT || 'http://localhost:9000'}/${this.bucket}/${fileKey}`,
      };
    } catch (error) {
      this.logger.error(`Failed to generate presigned upload URL for ${fileKey}:`, error);
      throw new Error(`Failed to generate upload URL: ${String(error)}`);
    }
  }

  async uploadFile(
    fileKey: string,
    fileBuffer: Buffer,
    contentType: string,
  ): Promise<{ key: string; url: string }> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: contentType,
      });

      await this.s3Client.send(command);
      this.logger.log(`File uploaded successfully: ${fileKey}`);

      return {
        key: fileKey,
        url: `${process.env.MINIO_ENDPOINT || 'http://localhost:9000'}/${this.bucket}/${fileKey}`,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file ${fileKey}:`, error);
      throw new Error(`Failed to upload file: ${String(error)}`);
    }
  }

  async getDownloadUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      this.logger.log(`Generated download URL for: ${fileKey}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate download URL for ${fileKey}:`, error);
      throw new Error(`Failed to generate download URL: ${String(error)}`);
    }
  }

  async deleteFile(fileKey: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${fileKey}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${fileKey}:`, error);
      throw new Error(`Failed to delete file: ${String(error)}`);
    }
  }
}
