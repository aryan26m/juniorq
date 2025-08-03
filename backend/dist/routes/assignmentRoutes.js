"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const assignmentController_1 = require("../controllers/assignmentController");
const auth_1 = require("../middleware/auth");
const fileUpload_1 = __importDefault(require("../middleware/fileUpload"));
const router = express_1.default.Router();
// Apply protect middleware to all routes
router.use(auth_1.protect);
// Get all assignments (students see published, teachers see their own)
router.get('/', assignmentController_1.getAssignments);
// Get single assignment
router.get('/:id', assignmentController_1.getAssignment);
// Create new assignment (Teacher/Admin only)
router.post('/', (0, auth_1.authorize)('teacher', 'admin'), [
    (0, express_validator_1.body)('title', 'Title is required').not().isEmpty(),
    (0, express_validator_1.body)('description', 'Description is required').not().isEmpty(),
    (0, express_validator_1.body)('dueDate', 'Due date is required').isISO8601().toDate(),
    (0, express_validator_1.body)('points', 'Points are required').isInt({ min: 0 }),
    (0, express_validator_1.body)('submissionType', 'Invalid submission type').isIn(['text', 'file', 'code', 'url']),
    (0, express_validator_1.body)('allowedFileTypes')
        .if((value, { req }) => req.body.submissionType === 'file')
        .isArray({ min: 1 })
        .withMessage('At least one allowed file type is required for file submissions'),
    (0, express_validator_1.body)('testCases')
        .if((value, { req }) => req.body.submissionType === 'code')
        .isArray({ min: 1 })
        .withMessage('At least one test case is required for code submissions'),
], assignmentController_1.createAssignment);
// Update assignment (Teacher/Admin only)
router.put('/:id', (0, auth_1.authorize)('teacher', 'admin'), [
    (0, express_validator_1.body)('title', 'Title is required').optional().not().isEmpty(),
    (0, express_validator_1.body)('description', 'Description is required').optional().not().isEmpty(),
    (0, express_validator_1.body)('dueDate', 'Invalid date').optional().isISO8601().toDate(),
    (0, express_validator_1.body)('points', 'Points must be a positive number').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('submissionType', 'Invalid submission type').optional().isIn(['text', 'file', 'code', 'url']),
], assignmentController_1.updateAssignment);
// Delete assignment (Teacher/Admin only)
router.delete('/:id', (0, auth_1.authorize)('teacher', 'admin'), assignmentController_1.deleteAssignment);
// Submit assignment (Student only)
router.post('/:id/submit', (0, auth_1.authorize)('student'), (req, res, next) => {
    // Handle file upload if submission type is file
    if (req.body.submissionType === 'file') {
        return fileUpload_1.default.single('file')(req, res, (err) => {
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
}, [
    (0, express_validator_1.body)('code')
        .if((value, { req }) => req.body.submissionType === 'code')
        .notEmpty()
        .withMessage('Code is required for code submissions'),
    (0, express_validator_1.body)('submission')
        .if((value, { req }) => ['text', 'url'].includes(req.body.submissionType))
        .notEmpty()
        .withMessage((value, { req }) => `${req.body.submissionType} submission is required`),
], assignmentController_1.submitAssignment);
// Grade submission (Teacher/Admin only)
router.put('/:id/grade/:submissionId', (0, auth_1.authorize)('teacher', 'admin'), [
    (0, express_validator_1.body)('grade', 'Grade is required').isFloat({ min: 0 }),
    (0, express_validator_1.body)('feedback', 'Feedback is required').not().isEmpty(),
], assignmentController_1.gradeSubmission);
exports.default = router;
