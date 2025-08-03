import mongoose, { Document, Schema } from 'mongoose';

export interface IQuiz extends Document {
  title: string;
  description: string;
  type: 'live' | 'practice' | 'daily' | 'weekly';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  
  // Quiz settings
  timeLimit?: number; // in minutes
  maxAttempts: number;
  isPublic: boolean;
  isActive: boolean;
  
  // Questions
  questions: {
    question: string;
    type: 'multiple_choice' | 'true_false' | 'short_answer' | 'coding';
    options?: string[];
    correctAnswer: string | string[];
    points: number;
    explanation?: string;
  }[];
  
  // Scoring
  totalPoints: number;
  passingScore: number;
  
  // Scheduling
  startTime?: Date;
  endTime?: Date;
  duration?: number; // in minutes
  
  // Created by
  createdBy: mongoose.Types.ObjectId;
  
  // Statistics
  totalAttempts: number;
  averageScore: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema({
  question: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['multiple_choice', 'true_false', 'short_answer', 'coding'],
    required: true
  },
  options: [{
    type: String,
    trim: true
  }],
  correctAnswer: {
    type: Schema.Types.Mixed,
    required: true
  },
  points: {
    type: Number,
    required: true,
    min: 1
  },
  explanation: {
    type: String,
    maxlength: 500
  }
});

const quizSchema = new Schema<IQuiz>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['live', 'practice', 'daily', 'weekly'],
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  
  // Quiz settings
  timeLimit: {
    type: Number,
    min: 1
  },
  maxAttempts: {
    type: Number,
    default: 1,
    min: 1
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Questions
  questions: [questionSchema],
  
  // Scoring
  totalPoints: {
    type: Number,
    required: true,
    min: 1
  },
  passingScore: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Scheduling
  startTime: Date,
  endTime: Date,
  duration: {
    type: Number,
    min: 1
  },
  
  // Created by
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Statistics
  totalAttempts: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for queries
quizSchema.index({ type: 1, isActive: 1 });
quizSchema.index({ category: 1, difficulty: 1 });
quizSchema.index({ createdBy: 1, createdAt: -1 });

export default mongoose.model<IQuiz>('Quiz', quizSchema); 