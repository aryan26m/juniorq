"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.post('/register', [
    (0, express_validator_1.body)('name', 'Name is required').not().isEmpty(),
    (0, express_validator_1.body)('email', 'Please include a valid email').isEmail(),
    (0, express_validator_1.body)('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
], authController_1.register);
router.post('/login', [
    (0, express_validator_1.body)('email', 'Please include a valid email').isEmail(),
    (0, express_validator_1.body)('password', 'Password is required').exists(),
], authController_1.login);
router.post('/forgotpassword', [(0, express_validator_1.body)('email', 'Please include a valid email').isEmail()], authController_1.forgotPassword);
router.put('/resetpassword/:resettoken', [(0, express_validator_1.body)('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })], authController_1.resetPassword);
// Protected routes
router.use(auth_1.protect);
router.get('/me', authController_1.getMe);
router.get('/logout', authController_1.logout);
exports.default = router;
