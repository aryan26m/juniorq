import { UserDocument } from '../../models/userModel';

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
      file?: Express.Multer.File;
      files?: {
        [fieldname: string]: Express.Multer.File[];
      };
    }
  }
}

export {};
