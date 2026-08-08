import { Request, Response, NextFunction } from 'express';
import { IImageUploader } from '../../application/ports/IImageUploader';
import { ApiError } from '../../../../utils/ApiError';

export class UploadController {
  constructor(private readonly imageUploader: IImageUploader) {}

  public uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new ApiError(400, 'No file provided');
      }

      const fileName = `img_${Date.now()}_${Math.round(Math.random() * 1e9)}`;
      const url = await this.imageUploader.upload(req.file.buffer, fileName);
      
      res.status(200).json({ url });
    } catch (error) {
      next(error);
    }
  };
}
