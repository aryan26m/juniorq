import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  title: string;
  description: string;
  type: 'group' | 'one-on-one';
  category: string;
  tags: string[];
  
  // Host and participants
  host: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  maxParticipants?: number;
  
  // Scheduling
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  timezone: string;
  
  // Session details
  meetingUrl?: string;
  meetingId?: string;
  meetingPassword?: string;
  platform: 'jitsi' | 'zoom' | 'teams' | 'custom';
  
  // Status
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  
  // Recording and materials
  recordingUrl?: string;
  materials?: string[];
  notes?: string;
  
  // Feedback
  rating?: number;
  feedback?: string;
  
  // Notifications
  reminderSent: boolean;
  reminderSentAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>({
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
    enum: ['group', 'one-on-one'],
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
  
  // Host and participants
  host: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxParticipants: {
    type: Number,
    min: 1
  },
  
  // Scheduling
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 15
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  
  // Session details
  meetingUrl: String,
  meetingId: String,
  meetingPassword: String,
  platform: {
    type: String,
    enum: ['jitsi', 'zoom', 'teams', 'custom'],
    default: 'jitsi'
  },
  
  // Status
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  
  // Recording and materials
  recordingUrl: String,
  materials: [String],
  notes: {
    type: String,
    maxlength: 5000
  },
  
  // Feedback
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    maxlength: 1000
  },
  
  // Notifications
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: Date
}, {
  timestamps: true
});

// Index for queries
sessionSchema.index({ host: 1, startTime: 1 });
sessionSchema.index({ participants: 1, startTime: 1 });
sessionSchema.index({ status: 1, startTime: 1 });

export default mongoose.model<ISession>('Session', sessionSchema); 