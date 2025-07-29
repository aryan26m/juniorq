import express, { Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import Note from '../models/Note';
import { processHandwrittenNotes } from '../utils/googleVision';

// Extend Express Request to include user
interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// @route   GET /api/notes
// @desc    Get user's notes
// @access  Private
router.get('/', [
  query('search').optional().trim(),
  query('category').optional().trim(),
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

    const { search, category, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = { user: (req.user as any).id };
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$text = { $search: search };
    }

    const notes = await Note.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Note.countDocuments(filter);

    res.json({
      success: true,
      data: notes,
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

// @route   POST /api/notes
// @desc    Create a new note (with image processing)
// @access  Private
router.post('/', [
  body('title').trim().notEmpty().isLength({ max: 200 }),
  body('imageData').optional().trim(),
  body('content').optional().trim().isLength({ max: 50000 }),
  body('category').optional().trim(),
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

    const { imageData, content, ...noteData } = req.body;
    let extractedText = '';
    let confidence = 0;

    // Process image if provided
    if (imageData) {
      const visionResult = await processHandwrittenNotes(
        imageData,
        process.env.GOOGLE_VISION_API_KEY || ''
      );

      if (visionResult.error) {
        return res.status(400).json({
          success: false,
          message: 'Failed to process image',
          error: visionResult.error
        });
      }

      extractedText = visionResult.text;
      confidence = visionResult.confidence;
    }

    const note = new Note({
      ...noteData,
      user: (req.user as any).id,
      content: content || extractedText,
      extractedText: extractedText,
      confidence: confidence,
      originalImage: imageData,
      processingStatus: imageData ? 'completed' : 'completed'
    });

    await note.save();

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: note
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/notes/:id
// @desc    Get a specific note
// @access  Private
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check if user can view this note
    if (note.user.toString() !== (req.user as any).id && !note.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this note'
      });
    }

    // Increment view count
    note.views += 1;
    await note.save();

    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/notes/:id
// @desc    Update a note
// @access  Private
router.put('/:id', [
  body('title').optional().trim().notEmpty().isLength({ max: 200 }),
  body('content').optional().trim().isLength({ max: 50000 }),
  body('category').optional().trim(),
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

    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    if (note.user.toString() !== (req.user as any).id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this note'
      });
    }

    // Save previous version
    if (req.body.content && req.body.content !== note.content) {
      // Initialize previousVersions array if it doesn't exist
      if (!note.previousVersions) {
        note.previousVersions = [];
      }
      note.previousVersions.push({
        content: note.content,
        editedAt: new Date(),
        editedBy: (req.user as any).id
      });
      note.version += 1;
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Note updated successfully',
      data: updatedNote
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
// @access  Private
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    if (note.user.toString() !== (req.user as any).id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this note'
      });
    }

    await Note.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router; 