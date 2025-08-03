import mongoose, { Document, Schema } from 'mongoose';

export interface IResource extends Document {
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  thumbnailUrl?: string;
  category: string;
  tags: string[];
  uploadedBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  downloadCount: number;
  viewCount: number;
  likes: mongoose.Types.ObjectId[];
  comments: {
    user: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
}

const ResourceSchema = new Schema<IResource>(
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
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    fileUrl: {
      type: String,
      required: [true, 'Please add a file URL'],
    },
    fileType: {
      type: String,
      required: [true, 'Please specify file type'],
      enum: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'mp4', 'mp3', 'zip', 'other'],
    },
    fileSize: {
      type: Number,
      required: [true, 'Please specify file size in bytes'],
    },
    thumbnailUrl: {
      type: String,
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: [
        'lecture-notes',
        'assignments',
        'past-papers',
        'study-guides',
        'tutorials',
        'code-snippets',
        'other',
      ],
    },
    tags: {
      type: [String],
      validate: {
        validator: function (tags: string[]) {
          return tags.length <= 10;
        },
        message: 'Cannot have more than 10 tags',
      },
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        text: {
          type: String,
          required: true,
          maxlength: [500, 'Comment cannot be more than 500 characters'],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add text index for search
ResourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Static method to get average rating of a resource
ResourceSchema.statics.getAverageRating = async function (resourceId: string) {
  const obj = await this.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(resourceId) },
    },
    {
      $lookup: {
        from: 'ratings',
        localField: '_id',
        foreignField: 'resource',
        as: 'ratings',
      },
    },
    {
      $addFields: {
        averageRating: { $avg: '$ratings.rating' },
        ratingCount: { $size: '$ratings' },
      },
    },
  ]);

  try {
    await this.model('Resource').findByIdAndUpdate(resourceId, {
      averageRating: obj[0]?.averageRating || 0,
      ratingCount: obj[0]?.ratingCount || 0,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ResourceSchema.post('save', function () {
  (this.constructor as any).getAverageRating(this._id);
});

// Call getAverageRating after rating is deleted
ResourceSchema.post('remove', function () {
  (this.constructor as any).getAverageRating(this._id);
});

const Resource = mongoose.model<IResource>('Resource', ResourceSchema);

export default Resource;
