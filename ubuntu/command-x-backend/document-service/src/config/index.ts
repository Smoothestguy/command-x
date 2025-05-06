import dotenv from 'dotenv';

dotenv.config();

export const config = {
  databaseUrl: process.env.DATABASE_URL,
  port: process.env.PORT || '3005',
  storageType: process.env.STORAGE_TYPE || 'LOCAL', // Default to LOCAL
  localStoragePath: process.env.LOCAL_STORAGE_PATH || '/home/ubuntu/command_x_uploads',
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    s3BucketName: process.env.S3_BUCKET_NAME,
  }
};

