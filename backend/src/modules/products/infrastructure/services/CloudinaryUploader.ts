import { v2 as cloudinary } from 'cloudinary';
import { IImageUploader } from '../../application/ports/IImageUploader';
import streamifier from 'streamifier';

export class CloudinaryUploader implements IImageUploader {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
      api_key: process.env.CLOUDINARY_API_KEY || '',
      api_secret: process.env.CLOUDINARY_API_SECRET || '',
    });
  }

  public upload(fileBuffer: Buffer, fileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'products', public_id: fileName },
        (error, result) => {
          if (result) resolve(result.secure_url);
          else reject(error);
        }
      );
      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  }
}
