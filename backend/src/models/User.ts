import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'senior' | 'admin';
  profilePicture?: string;
  bio?: string;
  grade?: string;
  school?: string;
  major?: string;
  graduationYear?: number;
  
  // Coding platform integrations
  codingPlatforms: {
    leetcode?: {
      username: string;
      verified: boolean;
      lastSync: Date;
      problemsSolved: number;
      rating?: number;
    };
    hackerrank?: {
      username: string;
      verified: boolean;
      lastSync: Date;
      problemsSolved: number;
    };
    codechef?: {
      username: string;
      verified: boolean;
      lastSync: Date;
      problemsSolved: number;
      rating?: number;
    };
  };
  
  // Statistics
  stats: {
    assignmentsCompleted: number;
    quizzesTaken: number;
    sessionsAttended: number;
    totalPoints: number;
    streakDays: number;
    lastActive: Date;
  };
  
  // Preferences
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    theme: 'light' | 'dark' | 'auto';
    timezone: string;
  };
  
  // Verification
  emailVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['student', 'senior', 'admin'],
    default: 'student'
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500
  },
  grade: String,
  school: String,
  major: String,
  graduationYear: Number,
  
  codingPlatforms: {
    leetcode: {
      username: String,
      verified: { type: Boolean, default: false },
      lastSync: Date,
      problemsSolved: { type: Number, default: 0 },
      rating: Number
    },
    hackerrank: {
      username: String,
      verified: { type: Boolean, default: false },
      lastSync: Date,
      problemsSolved: { type: Number, default: 0 }
    },
    codechef: {
      username: String,
      verified: { type: Boolean, default: false },
      lastSync: Date,
      problemsSolved: { type: Number, default: 0 },
      rating: Number
    }
  },
  
  stats: {
    assignmentsCompleted: { type: Number, default: 0 },
    quizzesTaken: { type: Number, default: 0 },
    sessionsAttended: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now }
  },
  
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    timezone: { type: String, default: 'UTC' }
  },
  
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update last active on save
userSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.stats.lastActive = new Date();
  }
  next();
});

export default mongoose.model<IUser>('User', userSchema); 