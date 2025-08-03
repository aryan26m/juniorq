import express from 'express';
import { body } from 'express-validator';
import {
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  uploadResourceFile,
  likeResource,
  unlikeResource,
  addComment,
  removeComment,
} from '../controllers/resourceController';
import { protect, authorize } from '../middleware/auth';
import fileUpload from '../middleware/fileUpload';

const router = express.Router();

// Public routes
router.get('/', getResources);
router.get('/:id', getResource);

// Protected routes
router.use(protect);

router.post(
  '/',
  [
    body('title', 'Title is required').not().isEmpty(),
    body('description', 'Description is required').not().isEmpty(),
    body('category', 'Category is required').not().isEmpty(),
  ],
  createResource
);

router.put(
  '/:id',
  [
    body('title', 'Title is required').optional().not().isEmpty(),
    body('description', 'Description is required').optional().not().isEmpty(),
    body('category', 'Category is required').optional().not().isEmpty(),
  ],
  updateResource
);

router.delete('/:id', deleteResource);

// File upload route
router.put(
  '/:id/file',
  fileUpload.single('file'),
  uploadResourceFile
);

// Like/Unlike routes
router.put('/:id/like', likeResource);
router.put('/:id/unlike', unlikeResource);

// Comment routes
router.post(
  '/:id/comments',
  [body('text', 'Text is required').not().isEmpty()],
  addComment
);

delete router.delete('/:id/comments/:comment_id', removeComment);
// Admin routes
router.use(authorize('admin'));
export default router;
