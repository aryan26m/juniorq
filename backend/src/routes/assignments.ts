import express, { Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import Assignment from '../models/Assignment';
import AssignmentSubmission from '../models/AssignmentSubmission';

// Extend Express Request to include user
interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// @route   GET /api/assignments
// @desc    Get assignments for user
// @access  Private
router.get('/', [
  query('status').optional().isIn(['active', 'completed', 'expired']),
  query('type').optional().isIn(['coding', 'quiz', 'reading', 'project']),
  query('difficulty').optional().isIn(['easy', 'medium', 'hard'])
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

    const { status, type, difficulty } = req.query;
    const filter: any = { assignedTo: (req.user as any).id };
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;

    const assignments = await Assignment.find(filter)
      .populate('assignedBy', 'firstName lastName')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/assignments
// @desc    Create a new assignment (admin/senior only)
// @access  Private
router.post('/', [
  body('title').trim().notEmpty().isLength({ max: 200 }),
  body('description').trim().notEmpty().isLength({ max: 2000 }),
  body('type').isIn(['coding', 'quiz', 'reading', 'project']),
  body('difficulty').isIn(['easy', 'medium', 'hard']),
  body('category').trim().notEmpty(),
  body('dueDate').isISO8601(),
  body('points').isInt({ min: 0 }),
  body('estimatedTime').isInt({ min: 1 }),
  body('instructions').trim().notEmpty().isLength({ max: 5000 }),
  body('assignedTo').isArray(),
  body('platform').optional().isIn(['leetcode', 'hackerrank', 'codechef']),
  body('problemId').optional().trim(),
  body('problemUrl').optional().isURL()
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

    if ((req.user as any).role !== 'admin' && (req.user as any).role !== 'senior') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create assignments'
      });
    }

    const assignmentData = {
      ...req.body,
      assignedBy: (req.user as any).id
    };

    const assignment = new Assignment(assignmentData);
    await assignment.save();

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('assignedBy', 'firstName lastName')
      .populate('assignedTo', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: populatedAssignment
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/assignments/:id
// @desc    Get a specific assignment
// @access  Private
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('assignedBy', 'firstName lastName')
      .populate('assignedTo', 'firstName lastName');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if user is assigned to this assignment
    const isAssigned = assignment.assignedTo.some(
      (userId: any) => userId.toString() === (req.user as any).id
    );

    if (!isAssigned && (req.user as any).role !== 'admin' && (req.user as any).role !== 'senior') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this assignment'
      });
    }

    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/assignments/:id/submit
// @desc    Submit assignment solution
// @access  Private
router.post('/:id/submit', [
  body('submissionText').optional().trim().isLength({ max: 10000 }),
  body('codeSolution').optional().trim().isLength({ max: 50000 }),
  body('attachments').optional().isArray(),
  body('submissionUrl').optional().isURL()
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

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if user is assigned to this assignment
    const isAssigned = assignment.assignedTo.some(
      (userId: any) => userId.toString() === (req.user as any).id
    );

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit this assignment'
      });
    }

    // Check if submission already exists
    const existingSubmission = await AssignmentSubmission.findOne({
      assignment: req.params.id,
      student: (req.user as any).id
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'Submission already exists for this assignment'
      });
    }

    const submission = new AssignmentSubmission({
      assignment: req.params.id,
      student: (req.user as any).id,
      status: 'submitted',
      submittedAt: new Date(),
      ...req.body
    });

    await submission.save();

    const populatedSubmission = await AssignmentSubmission.findById(submission._id)
      .populate('assignment')
      .populate('student', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: populatedSubmission
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/assignments/:id/submission
// @desc    Get user's submission for assignment
// @access  Private
router.get('/:id/submission', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const submission = await AssignmentSubmission.findOne({
      assignment: req.params.id,
      student: (req.user as any).id
    }).populate('assignment');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    next(error);
  }
});

export default router; 