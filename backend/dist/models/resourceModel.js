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
const mongoose_1 = __importStar(require("mongoose"));
const ResourceSchema = new mongoose_1.Schema({
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
            validator: function (tags) {
                return tags.length <= 10;
            },
            message: 'Cannot have more than 10 tags',
        },
    },
    uploadedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    comments: [
        {
            user: {
                type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Add text index for search
ResourceSchema.index({ title: 'text', description: 'text', tags: 'text' });
// Static method to get average rating of a resource
ResourceSchema.statics.getAverageRating = async function (resourceId) {
    var _a, _b;
    const obj = await this.aggregate([
        {
            $match: { _id: new mongoose_1.default.Types.ObjectId(resourceId) },
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
            averageRating: ((_a = obj[0]) === null || _a === void 0 ? void 0 : _a.averageRating) || 0,
            ratingCount: ((_b = obj[0]) === null || _b === void 0 ? void 0 : _b.ratingCount) || 0,
        });
    }
    catch (err) {
        console.error(err);
    }
};
// Call getAverageRating after save
ResourceSchema.post('save', function () {
    this.constructor.getAverageRating(this._id);
});
// Call getAverageRating after rating is deleted
ResourceSchema.post('remove', function () {
    this.constructor.getAverageRating(this._id);
});
const Resource = mongoose_1.default.model('Resource', ResourceSchema);
exports.default = Resource;
