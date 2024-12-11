import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: 'default',
      endpoint: this.configService.get<string>('LIARA_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get<string>('LIARA_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>('LIARA_SECRET_KEY'),
      },
    });
  }

  async uploadFileToS3(file: Express.Multer.File) {
    const filename = `${Date.now()}${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: this.configService.get<string>('LIARA_BUCKET_NAME'),
      Key: `khabarnameh/${filename}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    });

    try {
      await this.s3Client.send(command);
      return `https://project-files.storage.c2.liara.space/khabarnameh/${filename}`;
    } catch {
      throw new Error('Failed to upload file to S3');
    }
  }
}
