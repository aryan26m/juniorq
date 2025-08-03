import express, { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import AssignmentSubmission from '../models/AssignmentSubmission';
import Session from '../models/Session';

// Extend Express Request to include user
interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// @route   GET /api/progress/stats
// @desc    Get user progress statistics
// @access  Private
router.get('/stats', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById((req.user as any).id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    // Get additional stats
    const completedAssignments = await AssignmentSubmission.countDocuments({
      student: (req.user as any).id,
      status: 'completed'
    });

    const attendedSessions = await Session.countDocuments({
      participants: (req.user as any).id,
      status: 'completed'
    });

    const stats = {
      ...(user.stats || {}),
      assignmentsCompleted: completedAssignments,
      sessionsAttended: attendedSessions
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/progress/leaderboard
// @desc    Get leaderboard data
// @access  Private
router.get('/leaderboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
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