import express from 'express';
import { body } from 'express-validator';
import {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
} from '../controllers/assignmentController';
import { protect, authorize } from '../middleware/auth';
import fileUpload from '../middleware/fileUpload';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Get all assignments (students see published, teachers see their own)
router.get('/', getAssignments);

// Get single assignment
router.get('/:id', getAssignment);

// Create new assignment (Teacher/Admin only)
router.post(
  '/',
  authorize('teacher', 'admin'),
  [
    body('title', 'Title is required').not().isEmpty(),
    body('description', 'Description is required').not().isEmpty(),
    body('dueDate', 'Due date is required').isISO8601().toDate(),
    body('points', 'Points are required').isInt({ min: 0 }),
    body('submissionType', 'Invalid submission type').isIn(['text', 'file', 'code', 'url']),
    body('allowedFileTypes')
      .if((value: any, { req }: any) => req.body.submissionType === 'file')
      .isArray({ min: 1 })
      .withMessage('At least one allowed file type is required for file submissions'),
    body('testCases')
      .if((value: any, { req }: any) => req.body.submissionType === 'code')
      .isArray({ min: 1 })
      .withMessage('At least one test case is required for code submissions'),
  ],
  createAssignment
);

// Update assignment (Teacher/Admin only)
router.put(
  '/:id',
  authorize('teacher', 'admin'),
  [
    body('title', 'Title is required').optional().not().isEmpty(),
    body('description', 'Description is required').optional().not().isEmpty(),
    body('dueDate', 'Invalid date').optional().isISO8601().toDate(),
    body('points', 'Points must be a positive number').optional().isInt({ min: 0 }),
    body('submissionType', 'Invalid submission type').optional().isIn(['text', 'file', 'code', 'url']),
  ],
  updateAssignment
);

// Delete assignment (Teacher/Admin only)
router.delete('/:id', authorize('teacher', 'admin'), deleteAssignment);

// Submit assignment (Student only)
router.post(
  '/:id/submit',
  authorize('student'),
  (req: any, res: any, next: any) => {
    // Handle file upload if submission type is file
    if (req.body.submissionType === 'file') {
      return fileUpload.single('file')(req, res, (err: any) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message,
          });
        }
        next();
      });
    }
    next();
  },
  [
    body('code')
      .if((value: any, { req }: any) => req.body.submissionType === 'code')
      .notEmpty()
      .withMessage('Code is required for code submissions'),
    body('submission')
      .if((value: any, { req }: any) => ['text', 'url'].includes(req.body.submissionType))
      .notEmpty()
      .withMessage((value: any, { req }: any) => `${req.body.submissionType} submission is required`),
  ],
  submitAssignment
);

// Grade submission (Teacher/Admin only)
router.put(
  '/:id/grade/:submissionId',
  authorize('teacher', 'admin'),
  [
    body('grade', 'Grade is required').isFloat({ min: 0 }),
    body('feedback', 'Feedback is required').not().isEmpty(),
  ],
  gradeSubmission
);

export default router;
