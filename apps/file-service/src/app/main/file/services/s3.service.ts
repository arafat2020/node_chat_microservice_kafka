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
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });
    this.bucket = process.env.AWS_S3_BUCKET || "node-chat-files";
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
        url: `s3://${this.bucket}/${fileKey}`,
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
