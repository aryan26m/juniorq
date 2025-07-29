import mongoose, { Document, Schema } from 'mongoose';

export interface IResource extends Document {
  title: string;
  description: string;
  type: 'document' | 'video' | 'link' | 'image' | 'other';
  category: string;
  tags: string[];
  fileUrl?: string;
  fileSize?: number;
  fileName?: string;
  externalUrl?: string;
  uploadedBy: mongoose.Types.ObjectId;
  downloads: number;
  views: number;
  isPublic: boolean;
  approved: boolean;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const resourceSchema = new Schema<IResource>({
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
    enum: ['document', 'video', 'link', 'image', 'other'],
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
  fileUrl: String,
  fileSize: Number,
  fileName: String,
  externalUrl: String,
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  downloads: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  approved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date
}, {
  timestamps: true
});

// Index for search
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model<IResource>('Resource', resourceSchema); 