import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { getCodingPlatformStats, verifyCodingPlatformUsername } from '../utils/codingPlatforms';

// Extend Express Request to include user
interface AuthRequest extends Request {
  user?: any;
}

type Platform = 'leetcode' | 'hackerrank' | 'codechef';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('grade').optional().trim(),
  body('school').optional().trim(),
  body('major').optional().trim(),
  body('graduationYear').optional().isInt({ min: 1900, max: 2100 })
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

    const updateData = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/users/coding-platform
// @desc    Add coding platform username
// @access  Private
router.post('/coding-platform', [
  body('platform').isIn(['leetcode', 'hackerrank', 'codechef']),
  body('username').trim().notEmpty()
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

    const { platform, username } = req.body as { platform: Platform; username: string };

    // Verify username exists on platform
    const isValid = await verifyCodingPlatformUsername(platform, username);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${platform} username`
      });
    }

    // Get platform stats
    const stats: any = await getCodingPlatformStats(platform, username);

    // Update user's coding platform info
    const updateData: any = {
      [`codingPlatforms.${platform}.username`]: username,
      [`codingPlatforms.${platform}.verified`]: true,
      [`codingPlatforms.${platform}.lastSync`]: new Date(),
      [`codingPlatforms.${platform}.problemsSolved`]: stats.problemsSolved
    };

    if ((stats as any).rating) {
      updateData[`codingPlatforms.${platform}.rating`] = (stats as any).rating;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: `${platform} profile linked successfully`,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/users/coding-platform/:platform
// @desc    Remove coding platform username
// @access  Private
router.delete('/coding-platform/:platform', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { platform } = req.params as { platform: Platform };
    
    if (!['leetcode', 'hackerrank', 'codechef'].includes(platform)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid platform'
      });
    }

    const updateData: any = {
      [`codingPlatforms.${platform}`]: undefined
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $unset: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: `${platform} profile unlinked successfully`,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/users/sync-platform/:platform
// @desc    Sync coding platform stats
// @access  Private
router.post('/sync-platform/:platform', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { platform } = req.params as { platform: Platform };
    
    if (!['leetcode', 'hackerrank', 'codechef'].includes(platform)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid platform'
      });
    }

    const user = await User.findById(req.user.id);
    const platformData = (user?.codingPlatforms as any)[platform];

    if (!platformData || !platformData.username) {
      return res.status(400).json({
        success: false,
        message: `${platform} profile not linked`
      });
    }

    // Get updated stats
    const stats: any = await getCodingPlatformStats(platform, platformData.username);

    // Update user's stats
    const updateData: any = {
      [`codingPlatforms.${platform}.lastSync`]: new Date(),
      [`codingPlatforms.${platform}.problemsSolved`]: stats.problemsSolved
    };

    if ((stats as any).rating) {
      updateData[`codingPlatforms.${platform}.rating`] = (stats as any).rating;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: `${platform} stats synced successfully`,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', [
  body('emailNotifications').optional().isBoolean(),
  body('pushNotifications').optional().isBoolean(),
  body('theme').optional().isIn(['light', 'dark', 'auto']),
  body('timezone').optional().trim()
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

    const updateData: any = {};
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        updateData[`preferences.${key}`] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
});

export default router; 