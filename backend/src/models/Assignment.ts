import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignment extends Document {
  title: string;
  description: string;
  type: 'coding' | 'quiz' | 'reading' | 'project';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
  
  // Coding platform specific
  platform?: 'leetcode' | 'hackerrank' | 'codechef';
  problemId?: string;
  problemUrl?: string;
  
  // Assignment details
  dueDate: Date;
  points: number;
  estimatedTime: number; // in minutes
  instructions: string;
  attachments?: string[];
  
  // Auto-scheduling
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly';
  assignedTo: mongoose.Types.ObjectId[];
  assignedBy: mongoose.Types.ObjectId;
  
  // Status
  status: 'active' | 'completed' | 'expired' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['coding', 'quiz', 'reading', 'project'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Coding platform specific
  platform: {
    type: String,
    enum: ['leetcode', 'hackerrank', 'codechef']
  },
  problemId: String,
  problemUrl: String,
  
  // Assignment details
  dueDate: {
    type: Date,
    required: true
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  estimatedTime: {
    type: Number,
    required: true,
    min: 1
  },
  instructions: {
    type: String,
    required: true,
    maxlength: 5000
  },
  attachments: [String],
  
  // Auto-scheduling
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly']
  },
  assignedTo: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'completed', 'expired', 'draft'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for queries
assignmentSchema.index({ assignedTo: 1, dueDate: 1, status: 1 });
assignmentSchema.index({ category: 1, difficulty: 1 });

export default mongoose.model<IAssignment>('Assignment', assignmentSchema); 