import express, { Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import Session from '../models/Session';

// Extend Express Request to include user
interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// @route   GET /api/sessions
// @desc    Get sessions for user
// @access  Private
router.get('/', [
  query('status').optional().isIn(['scheduled', 'live', 'completed', 'cancelled']),
  query('type').optional().isIn(['group', 'one-on-one'])
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

    const { status, type } = req.query;
    const filter: any = {
      $or: [
        { host: (req.user as any).id },
        { participants: (req.user as any).id }
      ]
    };
    
    if (status) filter.status = status;
    if (type) filter.type = type;

    const sessions = await Session.find(filter)
      .populate('host', 'firstName lastName')
      .populate('participants', 'firstName lastName')
      .sort({ startTime: 1 });

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/sessions
// @desc    Create a new session (senior only)
// @access  Private
router.post('/', [
  body('title').trim().notEmpty().isLength({ max: 200 }),
  body('description').trim().notEmpty().isLength({ max: 2000 }),
  body('type').isIn(['group', 'one-on-one']),
  body('category').trim().notEmpty(),
  body('startTime').isISO8601(),
  body('duration').isInt({ min: 15, max: 480 }),
  body('maxParticipants').optional().isInt({ min: 1 }),
  body('participants').optional().isArray()
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

    if ((req.user as any).role !== 'senior' && (req.user as any).role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create sessions'
      });
    }

    const { startTime, duration, ...sessionData } = req.body;
    const endTime = new Date(new Date(startTime).getTime() + duration * 60000);

    const session = new Session({
      ...sessionData,
      host: (req.user as any).id,
      startTime,
      endTime,
      duration
    });

    await session.save();

    const populatedSession = await Session.findById(session._id)
      .populate('host', 'firstName lastName')
      .populate('participants', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: populatedSession
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/sessions/:id
// @desc    Get a specific session
// @access  Private
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('host', 'firstName lastName')
      .populate('participants', 'firstName lastName');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is part of this session
    const isParticipant = session.host.toString() === (req.user as any).id || 
                         session.participants.some((p: any) => p.toString() === (req.user as any).id);

    if (!isParticipant && (req.user as any).role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this session'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/sessions/:id/join
// @desc    Join a session
// @access  Private
router.post('/:id/join', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Session is not available for joining'
      });
    }

    if (session.maxParticipants && session.participants.length >= session.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Session is full'
      });
    }

    if (session.participants.includes((req.user as any).id)) {
      return res.status(400).json({
        success: false,
        message: 'Already joined this session'
      });
    }

    session.participants.push((req.user as any).id);
    await session.save();

    const populatedSession = await Session.findById(session._id)
      .populate('host', 'firstName lastName')
      .populate('participants', 'firstName lastName');

    res.json({
      success: true,
      message: 'Joined session successfully',
      data: populatedSession
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/sessions/:id/leave
// @desc    Leave a session
// @access  Private
router.post('/:id/leave', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (!session.participants.includes((req.user as any).id)) {
      return res.status(400).json({
        success: false,
        message: 'Not joined this session'
      });
    }

    session.participants = session.participants.filter(
      (p: any) => p.toString() !== (req.user as any).id
    );
    await session.save();

    const populatedSession = await Session.findById(session._id)
      .populate('host', 'firstName lastName')
      .populate('participants', 'firstName lastName');

    res.json({
      success: true,
      message: 'Left session successfully',
      data: populatedSession
    });
  } catch (error) {
    next(error);
  }
});

export default router; 