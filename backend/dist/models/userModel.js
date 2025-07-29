"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false,
    },
    role: {
        type: String,
        enum: ['student', 'mentor', 'admin'],
        default: 'student',
    },
    avatar: {
        type: String,
        default: 'default.jpg',
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot be more than 500 characters'],
    },
    codingProfiles: {
        leetcode: String,
        hackerrank: String,
        codechef: String,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, {
    timestamps: true,
});
// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcryptjs_1.default.genSalt(10);
    this.password = await bcryptjs_1.default.hash(this.password, salt);
});
// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });
};
// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcryptjs_1.default.compare(enteredPassword, this.password);
};
// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    // Set expire (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
};
const User = mongoose_1.default.models.User || mongoose_1.default.model('User', UserSchema);
exports.default = User;
