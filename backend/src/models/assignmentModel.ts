import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITestCase {
  input: any;
  expectedOutput: any;
  isHidden: boolean;
}

export interface ICodeExecutionResult {
  passed: number;
  failed: number;
  total: number;
  details: Array<{
    testCaseId: number;
    input: any;
    expectedOutput: any;
    actualOutput?: any;
    passed: boolean;
    executionTime?: number;
    error?: string;
  }>;
}

export interface ISubmission {
  _id?: Types.ObjectId;
  student: Types.ObjectId;
  submission: string; // text, file URL, or code
  submissionType: 'text' | 'file' | 'code' | 'url';
  submittedAt: Date;
  graded: boolean;
  grade?: number;
  feedback?: string;
  gradedBy?: Types.ObjectId;
  gradedAt?: Date;
  executionResult?: ICodeExecutionResult;
  status?: 'submitted' | 'graded' | 'passed' | 'failed' | 'error';
  testResults?: Array<{
    input: any;
    expectedOutput: any;
    actualOutput?: any;
    isPassed: boolean;
    executionTime?: number;
    error?: string;
  }>;
}

export interface IAssignment extends Document {
  title: string;
  description: string;
  instructions?: string;
  dueDate: Date;
  points: number;
  submissionType: 'text' | 'file' | 'code' | 'url';
  allowedFileTypes?: string[];
  maxFileSize?: number; // in MB
  codeTemplate?: string;
  testCases?: ITestCase[];
  resources?: {
    title: string;
    url: string;
    type: 'document' | 'video' | 'link' | 'other';
  }[];
  createdBy: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  submissions: ISubmission[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
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
        validator: function (types: string[]) {
          if (this.submissionType !== 'file') return true;
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
          type: mongoose.Schema.Types.Mixed,
          required: true,
        },
        expectedOutput: {
          type: mongoose.Schema.Types.Mixed,
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
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    submissions: [
      {
        student: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        submission: {
          type: mongoose.Schema.Types.Mixed,
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
          type: Schema.Types.ObjectId,
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
                type: mongoose.Schema.Types.Mixed,
                required: true,
              },
              expectedOutput: {
                type: mongoose.Schema.Types.Mixed,
                required: true,
              },
              actualOutput: {
                type: mongoose.Schema.Types.Mixed,
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add index for better query performance
AssignmentSchema.index({ course: 1, isPublished: 1, dueDate: 1 });
AssignmentSchema.index({ 'submissions.student': 1 });

// Virtual for submission count
AssignmentSchema.virtual('submissionCount').get(function () {
  return this.submissions.length;
});

// Virtual for average grade
AssignmentSchema.virtual('averageGrade').get(function () {
  if (this.submissions.length === 0) return 0;
  
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
export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
export default Assignment;
