import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignmentSubmission extends Document {
  assignment: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  status: 'pending' | 'submitted' | 'completed' | 'verified' | 'failed';
  
  // Submission details
  submissionText?: string;
  codeSolution?: string;
  attachments?: string[];
  submissionUrl?: string;
  
  // Coding platform verification
  platformSubmissionId?: string;
  platformStatus?: 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'runtime_error';
  platformScore?: number;
  platformRuntime?: number;
  platformMemory?: number;
  
  // Manual verification
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  verificationNotes?: string;
  pointsAwarded?: number;
  
  // Timestamps
  submittedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSubmissionSchema = new Schema<IAssignmentSubmission>({
  assignment: {
    type: Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'completed', 'verified', 'failed'],
    default: 'pending'
  },
  
  // Submission details
  submissionText: {
    type: String,
    maxlength: 10000
  },
  codeSolution: {
    type: String,
    maxlength: 50000
  },
  attachments: [String],
  submissionUrl: String,
  
  // Coding platform verification
  platformSubmissionId: String,
  platformStatus: {
    type: String,
    enum: ['accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error']
  },
  platformScore: Number,
  platformRuntime: Number,
  platformMemory: Number,
  
  // Manual verification
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  verificationNotes: {
    type: String,
    maxlength: 1000
  },
  pointsAwarded: {
    type: Number,
    min: 0
  },
  
  // Timestamps
  submittedAt: Date,
  completedAt: Date
}, {
  timestamps: true
});

// Ensure unique submission per student per assignment
assignmentSubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

// Index for queries
assignmentSubmissionSchema.index({ student: 1, status: 1 });
assignmentSubmissionSchema.index({ assignment: 1, status: 1 });

export default mongoose.model<IAssignmentSubmission>('AssignmentSubmission', assignmentSubmissionSchema); 