import express, { Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import Resource from '../models/Resource';

// Extend Express Request to include user
interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// @route   GET /api/resources
// @desc    Get all resources with filtering and search
// @access  Private
router.get('/', [
  query('search').optional().trim(),
  query('category').optional().trim(),
  query('type').optional().isIn(['document', 'video', 'link', 'image', 'other']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { search, category, type, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build filter
    const filter: any = { isPublic: true, approved: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (search) {
      filter.$text = { $search: search };
    }

    const resources = await Resource.find(filter)
      .populate('uploadedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Resource.countDocuments(filter);

    res.json({
      success: true,
      data: resources,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/resources
// @desc    Upload a new resource
// @access  Private
router.post('/', [
  body('title').trim().notEmpty().isLength({ max: 200 }),
  body('description').trim().notEmpty().isLength({ max: 1000 }),
  body('type').isIn(['document', 'video', 'link', 'image', 'other']),
  body('category').trim().notEmpty(),
  body('tags').optional().isArray(),
  body('fileUrl').optional().isURL(),
  body('externalUrl').optional().isURL(),
  body('isPublic').optional().isBoolean()
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const resourceData = {
      ...req.body,
      uploadedBy: req.user.id,
      approved: req.user.role === 'admin' || req.user.role === 'senior'
    };

    const resource = new Resource(resourceData);
    await resource.save();

    const populatedResource = await Resource.findById(resource._id)
      .populate('uploadedBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Resource uploaded successfully',
      data: populatedResource
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/resources/:id
// @desc    Get a specific resource
// @access  Private
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('uploadedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Increment view count
    resource.views += 1;
    await resource.save();

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/resources/:id
// @desc    Update a resource
// @access  Private
router.put('/:id', [
  body('title').optional().trim().notEmpty().isLength({ max: 200 }),
  body('description').optional().trim().notEmpty().isLength({ max: 1000 }),
  body('category').optional().trim().notEmpty(),
  body('tags').optional().isArray(),
  body('isPublic').optional().isBoolean()
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check if user can edit this resource
    if (resource.uploadedBy.toString() !== (req.user as any).id && (req.user as any).role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this resource'
      });
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Resource updated successfully',
      data: updatedResource
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/resources/:id
// @desc    Delete a resource
// @access  Private
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check if user can delete this resource
    if (resource.uploadedBy.toString() !== (req.user as any).id && (req.user as any).role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this resource'
      });
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/resources/:id/download
// @desc    Record a download
// @access  Private
router.post('/:id/download', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    resource.downloads += 1;
    await resource.save();

    res.json({
      success: true,
      message: 'Download recorded'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/resources/categories
// @desc    Get all resource categories
// @access  Private
router.get('/categories', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await Resource.distinct('category', { isPublic: true, approved: true });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
});

export default router; 