import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import path from 'path';
import fs from 'fs';
import Resource from '../models/resourceModel';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const pipelineAsync = promisify(pipeline);

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
export const getResources = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    let query = Resource.find(JSON.parse(queryStr)).populate('uploadedBy', 'name email avatar');

    // Select Fields
    if (req.query.select) {
      const fields = (req.query.select as string).split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = (req.query.sort as string).split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Search
    if (req.query.search) {
      const searchQuery = {
        $or: [
          { title: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } },
          { tags: { $in: [new RegExp(req.query.search as string, 'i')] } },
        ],
      };
      query = query.find(searchQuery);
    }

    // Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Resource.countDocuments(query.getQuery());

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const resources = await query;

    // Pagination result
    const pagination: any = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: resources.length,
      pagination,
      data: resources,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Public
export const getResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('uploadedBy', 'name email avatar');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Increment view count
    resource.viewCount += 1;
    await resource.save();

    res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new resource
// @route   POST /api/resources
// @access  Private
export const createResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Add user to req.body
    req.body.uploadedBy = (req as any).user.id;

    const resource = await Resource.create(req.body);

    res.status(201).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private
export const updateResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Make sure user is resource owner or admin
    if (resource.uploadedBy.toString() !== (req as any).user.id && (req as any).user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `User ${(req as any).user.id} is not authorized to update this resource`,
      });
    }

    resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private
export const deleteResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Make sure user is resource owner or admin
    if (resource.uploadedBy.toString() !== (req as any).user.id && (req as any).user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `User ${(req as any).user.id} is not authorized to delete this resource`,
      });
    }

    // Delete file from storage (S3 or local)
    if (process.env.STORAGE_TYPE === 's3') {
      // Delete from S3
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME || 'juniorq-resources',
        Key: resource.fileUrl.split('/').pop(),
      };

      try {
        await s3Client.send(new DeleteObjectCommand(params));
      } catch (error) {
        console.error('Error deleting file from S3:', error);
      }
    } else {
      // Delete local file
      const filePath = path.join(__dirname, `../../public/uploads/${resource.fileUrl}`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await resource.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload file for resource
// @route   PUT /api/resources/:id/file
// @access  Private
export const uploadResourceFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded.',
      });
    }

    const file = (req.files as any).file;
    const fileExt = path.extname(file.name).toLowerCase();
    const fileName = `${uuidv4()}${fileExt}`;

    // Check file type
    const allowedFileTypes = [
      '.pdf',
      '.doc',
      '.docx',
      '.ppt',
      '.pptx',
      '.xls',
      '.xlsx',
      '.jpg',
      '.jpeg',
      '.png',
      '.mp4',
      '.mp3',
      '.zip',
    ];

    if (!allowedFileTypes.includes(fileExt)) {
      return res.status(400).json({
        success: false,
        message: `File type ${fileExt} is not allowed`,
      });
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds the limit of 50MB',
      });
    }

    let fileUrl;

    // Upload to S3 if configured, otherwise save locally
    if (process.env.STORAGE_TYPE === 's3') {
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME || 'juniorq-resources',
        Key: fileName,
        Body: file.data,
        ContentType: file.mimetype,
        ACL: 'public-read',
      };

      const command = new PutObjectCommand(params);
      await s3Client.send(command);

      fileUrl = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    } else {
      // Save file locally
      const uploadPath = path.join(__dirname, '../../public/uploads');
      
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      const filePath = path.join(uploadPath, fileName);
      await file.mv(filePath);
      fileUrl = `/uploads/${fileName}`;
    }

    // Update resource with file URL and metadata
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      {
        fileUrl,
        fileType: fileExt.replace('.', ''),
        fileSize: file.size,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like a resource
// @route   PUT /api/resources/:id/like
// @access  Private
export const likeResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Check if the resource has already been liked by this user
    if (resource.likes.includes((req as any).user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Resource already liked',
      });
    }

    resource.likes.unshift((req as any).user.id);
    await resource.save();

    res.status(200).json({
      success: true,
      data: resource.likes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unlike a resource
// @route   PUT /api/resources/:id/unlike
// @access  Private
export const unlikeResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Check if the resource has been liked by this user
    if (!resource.likes.includes((req as any).user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Resource has not yet been liked',
      });
    }

    // Get remove index
    const removeIndex = resource.likes.indexOf((req as any).user.id);
    resource.likes.splice(removeIndex, 1);
    await resource.save();

    res.status(200).json({
      success: true,
      data: resource.likes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to resource
// @route   POST /api/resources/:id/comments
// @access  Private
export const addComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;

    const newComment = {
      text,
      user: (req as any).user.id,
    };

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    resource.comments.unshift(newComment as any);
    await resource.save();

    res.status(200).json({
      success: true,
      data: resource.comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove comment from resource
// @route   DELETE /api/resources/:id/comments/:comment_id
// @access  Private
export const removeComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Find comment
    const comment = resource.comments.find(
      (comment) => comment._id?.toString() === req.params.comment_id
    );

    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check user is comment owner or admin
    if (
      comment.user.toString() !== (req as any).user.id &&
      (req as any).user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this comment',
      });
    }

    // Get remove index
    const removeIndex = resource.comments.findIndex(
      (comment) => comment._id?.toString() === req.params.comment_id
    );
    resource.comments.splice(removeIndex, 1);
    await resource.save();

    res.status(200).json({
      success: true,
      data: resource.comments,
    });
  } catch (error) {
    next(error);
  }
};
