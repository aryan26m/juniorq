import express, { Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import Quiz from '../models/Quiz';

const router = express.Router();

// @route   GET /api/quizzes
// @desc    Get available quizzes
// @access  Private
router.get('/', [
  query('type').optional().isIn(['live', 'practice', 'daily', 'weekly']),
  query('category').optional().trim(),
  query('difficulty').optional().isIn(['easy', 'medium', 'hard'])
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { type, category, difficulty } = req.query;
    const filter: any = { isActive: true };
    
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const quizzes = await Quiz.find(filter)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/quizzes/:id
// @desc    Get a specific quiz
// @access  Private
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('createdBy', 'firstName lastName');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    next(error);
  }
});

export default router; 