"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const resourceController_1 = require("../controllers/resourceController");
const auth_1 = require("../middleware/auth");
const fileUpload_1 = __importDefault(require("../middleware/fileUpload"));
const router = express_1.default.Router();
// Public routes
router.get('/', resourceController_1.getResources);
router.get('/:id', resourceController_1.getResource);
// Protected routes
router.use(auth_1.protect);
router.post('/', [
    (0, express_validator_1.body)('title', 'Title is required').not().isEmpty(),
    (0, express_validator_1.body)('description', 'Description is required').not().isEmpty(),
    (0, express_validator_1.body)('category', 'Category is required').not().isEmpty(),
], resourceController_1.createResource);
router.put('/:id', [
    (0, express_validator_1.body)('title', 'Title is required').optional().not().isEmpty(),
    (0, express_validator_1.body)('description', 'Description is required').optional().not().isEmpty(),
    (0, express_validator_1.body)('category', 'Category is required').optional().not().isEmpty(),
], resourceController_1.updateResource);
router.delete('/:id', resourceController_1.deleteResource);
// File upload route
router.put('/:id/file', fileUpload_1.default.single('file'), resourceController_1.uploadResourceFile);
// Like/Unlike routes
router.put('/:id/like', resourceController_1.likeResource);
router.put('/:id/unlike', resourceController_1.unlikeResource);
// Comment routes
router.post('/:id/comments', [(0, express_validator_1.body)('text', 'Text is required').not().isEmpty()], resourceController_1.addComment);
delete router.delete('/:id/comments/:comment_id', resourceController_1.removeComment);
// Admin routes
router.use((0, auth_1.authorize)('admin'));
// Additional admin-only routes can be added here
exports.default = router;
