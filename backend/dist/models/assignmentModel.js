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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Assignment = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AssignmentSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    instructions: {
        type: String,
    },
    dueDate: {
        type: Date,
        required: [true, 'Please add a due date'],
    },
    points: {
        type: Number,
        required: [true, 'Please add points'],
        min: [0, 'Points must be a positive number'],
    },
    submissionType: {
        type: String,
        required: true,
        enum: ['text', 'file', 'code', 'url'],
    },
    allowedFileTypes: {
        type: [String],
        validate: {
            validator: function (types) {
                if (this.submissionType !== 'file')
                    return true;
                return types && types.length > 0;
            },
            message: 'At least one file type is required for file submissions',
        },
    },
    maxFileSize: {
        type: Number, // in MB
        default: 10,
    },
    codeTemplate: {
        type: String,
        required: function () {
            return this.submissionType === 'code';
        },
    },
    testCases: [
        {
            input: {
                type: mongoose_1.default.Schema.Types.Mixed,
                required: true,
            },
            expectedOutput: {
                type: mongoose_1.default.Schema.Types.Mixed,
                required: true,
            },
            isHidden: {
                type: Boolean,
                default: false,
            },
        },
    ],
    resources: [
        {
            title: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
            type: {
                type: String,
                enum: ['document', 'video', 'link', 'other'],
                default: 'document',
            },
        },
    ],
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    course: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    submissions: [
        {
            student: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            submission: {
                type: mongoose_1.default.Schema.Types.Mixed,
                required: true,
            },
            submittedAt: {
                type: Date,
                default: Date.now,
            },
            graded: {
                type: Boolean,
                default: false,
            },
            grade: {
                type: Number,
                min: 0,
            },
            feedback: {
                type: String,
            },
            gradedBy: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
            },
            gradedAt: {
                type: Date,
            },
            executionResult: {
                passed: {
                    type: Number,
                    default: 0,
                },
                failed: {
                    type: Number,
                    default: 0,
                },
                total: {
                    type: Number,
                    default: 0,
                },
                details: [
                    {
                        testCaseId: {
                            type: Number,
                            required: true,
                        },
                        input: {
                            type: mongoose_1.default.Schema.Types.Mixed,
                            required: true,
                        },
                        expectedOutput: {
                            type: mongoose_1.default.Schema.Types.Mixed,
                            required: true,
                        },
                        actualOutput: {
                            type: mongoose_1.default.Schema.Types.Mixed,
                        },
                        passed: {
                            type: Boolean,
                            required: true,
                        },
                        executionTime: {
                            type: Number,
                        },
                        error: {
                            type: String,
                        },
                    },
                ],
            },
        },
    ],
    isPublished: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Add index for better query performance
AssignmentSchema.index({ course: 1, isPublished: 1, dueDate: 1 });
AssignmentSchema.index({ 'submissions.student': 1 });
// Virtual for submission count
AssignmentSchema.virtual('submissionCount').get(function () {
    return this.submissions.length;
});
// Virtual for average grade
AssignmentSchema.virtual('averageGrade').get(function () {
    if (this.submissions.length === 0)
        return 0;
    const total = this.submissions.reduce((sum, submission) => {
        return sum + (submission.grade || 0);
    }, 0);
    return total / this.submissions.length;
});
// Pre-save hook to validate test cases for code submissions
AssignmentSchema.pre('save', function (next) {
    if (this.submissionType === 'code' && (!this.testCases || this.testCases.length === 0)) {
        throw new Error('At least one test case is required for code submissions');
    }
    next();
});
// Export the schema and model
exports.Assignment = mongoose_1.default.model('Assignment', AssignmentSchema);
exports.default = exports.Assignment;
