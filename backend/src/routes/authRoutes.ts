import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  logout,
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post(
  '/register',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  register
);

router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  login
);

router.post(
  '/forgotpassword',
  [body('email', 'Please include a valid email').isEmail()],
  forgotPassword
);

router.put(
  '/resetpassword/:resettoken',
  [body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })],
  resetPassword
);

// Protected routes
router.use(protect);

router.get('/me', getMe);
router.get('/logout', logout);

export default router;
