import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  title: string;
  content: string;
  originalImage?: string;
  extractedText: string;
  confidence: number;
  
  // User and organization
  user: mongoose.Types.ObjectId;
  tags: string[];
  category?: string;
  
  // Processing status
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingError?: string;
  
  // Metadata
  language?: string;
  wordCount: number;
  isPublic: boolean;
  isEditable: boolean;
  
  // Version control
  version: number;
  previousVersions?: {
    content: string;
    editedAt: Date;
    editedBy: mongoose.Types.ObjectId;
  }[];
  
  // Statistics
  views: number;
  downloads: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 50000
  },
  originalImage: String,
  extractedText: {
    type: String,
    required: true,
    maxlength: 50000
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  
  // User and organization
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    trim: true
  },
  
  // Processing status
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingError: {
    type: String,
    maxlength: 1000
  },
  
  // Metadata
  language: {
    type: String,
    default: 'en'
  },
  wordCount: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isEditable: {
    type: Boolean,
    default: true
  },
  
  // Version control
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    content: {
      type: String,
      required: true
    },
    editedAt: {
      type: Date,
      default: Date.now
    },
    editedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  
  // Statistics
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search
noteSchema.index({ title: 'text', content: 'text', extractedText: 'text', tags: 'text' });

// Index for queries
noteSchema.index({ user: 1, createdAt: -1 });
noteSchema.index({ processingStatus: 1 });
noteSchema.index({ category: 1, tags: 1 });

// Calculate word count before saving
noteSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.wordCount = this.content.split(/\s+/).filter(word => word.length > 0).length;
  }
  next();
});

export default mongoose.model<INote>('Note', noteSchema); 