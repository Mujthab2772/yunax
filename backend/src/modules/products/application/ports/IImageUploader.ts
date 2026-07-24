export interface IImageUploader {
  upload(fileBuffer: Buffer, fileName: string): Promise<string>;
}
