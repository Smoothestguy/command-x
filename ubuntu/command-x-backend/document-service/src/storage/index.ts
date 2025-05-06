import fs from 'fs';
import path from 'path';
import { S3 } from 'aws-sdk';
import { config } from '../config';

let s3: S3 | null = null;
if (config.storageType === 'S3' && config.aws.accessKeyId && config.aws.secretAccessKey && config.aws.region && config.aws.s3BucketName) {
    s3 = new S3({
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
        region: config.aws.region,
    });
} else if (config.storageType === 'LOCAL') {
    // Ensure local storage directory exists
    if (!fs.existsSync(config.localStoragePath)) {
        fs.mkdirSync(config.localStoragePath, { recursive: true });
        console.log(`Created local storage directory: ${config.localStoragePath}`);
    }
}

export const uploadFile = async (file: Express.Multer.File): Promise<string> => {
    const uniqueFilename = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;

    if (config.storageType === 'S3' && s3 && config.aws.s3BucketName) {
        const params = {
            Bucket: config.aws.s3BucketName,
            Key: uniqueFilename,
            Body: file.buffer,
            ContentType: file.mimetype,
        };
        const data = await s3.upload(params).promise();
        return data.Location; // Return S3 URL
    } else {
        // Local storage
        const filePath = path.join(config.localStoragePath, uniqueFilename);
        await fs.promises.writeFile(filePath, file.buffer);
        // Return a relative path or identifier for local storage
        // For simplicity, returning the filename which can be used to construct a download path
        return uniqueFilename;
    }
};

export const getFileStream = (filePathOrKey: string): fs.ReadStream | S3.GetObjectOutput['Body'] | null => {
    if (config.storageType === 'S3' && s3 && config.aws.s3BucketName) {
        const params = {
            Bucket: config.aws.s3BucketName,
            Key: filePathOrKey, // Assuming filePathOrKey is the S3 Key
        };
        try {
             // Check if object exists first to avoid errors on stream creation for non-existent objects
            // await s3.headObject(params).promise(); // This might be needed depending on error handling strategy
            return s3.getObject(params).createReadStream();
        } catch (error) {
            console.error(`Error getting S3 object stream for key ${filePathOrKey}:`, error);
            return null;
        }
    } else {
        // Local storage
        const filePath = path.join(config.localStoragePath, filePathOrKey);
        if (fs.existsSync(filePath)) {
            return fs.createReadStream(filePath);
        } else {
            console.error(`Local file not found: ${filePath}`);
            return null;
        }
    }
};

export const deleteFile = async (filePathOrKey: string): Promise<void> => {
    if (config.storageType === 'S3' && s3 && config.aws.s3BucketName) {
        const params = {
            Bucket: config.aws.s3BucketName,
            Key: filePathOrKey,
        };
        try {
            await s3.deleteObject(params).promise();
            console.log(`Deleted S3 object: ${filePathOrKey}`);
        } catch (error) {
            console.error(`Error deleting S3 object ${filePathOrKey}:`, error);
            // Decide if you want to throw error or just log
        }
    } else {
        // Local storage
        const filePath = path.join(config.localStoragePath, filePathOrKey);
        if (fs.existsSync(filePath)) {
            try {
                await fs.promises.unlink(filePath);
                console.log(`Deleted local file: ${filePath}`);
            } catch (error) {
                console.error(`Error deleting local file ${filePath}:`, error);
                 // Decide if you want to throw error or just log
            }
        } else {
             console.warn(`Attempted to delete non-existent local file: ${filePath}`);
        }
    }
};

