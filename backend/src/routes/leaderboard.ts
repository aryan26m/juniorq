import express, { Request, Response, NextFunction } from 'express';
import User from '../models/User';

const router = express.Router();

// @route   GET /api/leaderboard/daily
// @desc    Get daily leaderboard
// @access  Private
router.get('/daily', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const leaderboard = await User.aggregate([
      {
        $match: {
          'stats.lastActive': { $gte: today, $lt: tomorrow }
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          stats: 1,
          totalPoints: { $sum: ['$stats.totalPoints', '$stats.streakDays'] }
        }
      },
      {
        $sort: { totalPoints: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/leaderboard/weekly
// @desc    Get weekly leaderboard
// @access  Private
router.get('/weekly', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const leaderboard = await User.aggregate([
      {
        $match: {
          'stats.lastActive': { $gte: weekAgo }
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          stats: 1,
          totalPoints: { $sum: ['$stats.totalPoints', '$stats.streakDays'] }
        }
      },
      {
        $sort: { totalPoints: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/leaderboard/all-time
// @desc    Get all-time leaderboard
// @access  Private
router.get('/all-time', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leaderboard = await User.aggregate([
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          stats: 1,
          totalPoints: { $sum: ['$stats.totalPoints', '$stats.streakDays'] }
        }
      },
      {
        $sort: { totalPoints: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    next(error);
  }
});

export default router; 