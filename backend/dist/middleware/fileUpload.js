"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fieldsFileUpload = exports.multipleFileUpload = exports.singleFileUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Set storage engine
const storage = multer_1.default.diskStorage({
    // @ts-ignore
    destination: (req, file, cb) => {
        const uploadPath = path_1.default.join(__dirname, '../../public/uploads');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
// Check file type
const checkFileType = (file, cb) => {
    // Allowed extensions
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|xls|xlsx|mp4|mp3|zip/;
    // Check extension
    const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
    // Check mime type
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    }
    else {
        cb(new Error('Error: Invalid file type. Only images, documents, videos, and archives are allowed.'), false);
    }
};
// Initialize upload
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    },
});
// Middleware for handling single file upload
const singleFileUpload = (fieldName) => {
    return (req, res, next) => {
        upload.single(fieldName)(req, res, (err) => {
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
exports.singleFileUpload = singleFileUpload;
// Middleware for handling multiple file uploads
const multipleFileUpload = (fieldName, maxCount = 5) => {
    return (req, res, next) => {
        upload.array(fieldName, maxCount)(req, res, (err) => {
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
exports.multipleFileUpload = multipleFileUpload;
// Middleware for handling multiple fields with multiple files
const fieldsFileUpload = (fields) => {
    return (req, res, next) => {
        upload.fields(fields)(req, res, (err) => {
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
exports.fieldsFileUpload = fieldsFileUpload;
exports.default = upload;
