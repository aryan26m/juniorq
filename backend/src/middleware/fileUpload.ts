import multer from 'multer';
import { Request } from 'express';
import path from 'path';

// Set storage engine
const storage = multer.diskStorage({
  // @ts-ignore
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadPath = path.join(__dirname, '../../public/uploads');
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Check file type
const checkFileType = (file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|xls|xlsx|mp4|mp3|zip/;
  
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Invalid file type. Only images, documents, videos, and archives are allowed.'), false);
  }
};

// Initialize upload
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
    checkFileType(file, cb);
  },
});

// Middleware for handling single file upload
export const singleFileUpload = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req, res, (err: any) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  };
};

// Middleware for handling multiple file uploads
export const multipleFileUpload = (fieldName: string, maxCount: number = 5) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.array(fieldName, maxCount)(req, res, (err: any) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  };
};

// Middleware for handling multiple fields with multiple files
export const fieldsFileUpload = (fields: { name: string; maxCount?: number }[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.fields(fields)(req, res, (err: any) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  };
};

export default upload;
