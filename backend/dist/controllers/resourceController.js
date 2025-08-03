"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeComment = exports.addComment = exports.unlikeResource = exports.likeResource = exports.uploadResourceFile = exports.deleteResource = exports.updateResource = exports.createResource = exports.getResource = exports.getResources = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const resourceModel_1 = __importDefault(require("../models/resourceModel"));
const uuid_1 = require("uuid");
const util_1 = require("util");
const stream_1 = require("stream");
const client_s3_1 = require("@aws-sdk/client-s3");
const pipelineAsync = (0, util_1.promisify)(stream_1.pipeline);
// Initialize S3 client
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});
// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
const getResources = async (req, res, next) => {
    try {
        // Copy req.query
        const reqQuery = { ...req.query };
        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
        // Loop over removeFields and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);
        // Create query string
        let queryStr = JSON.stringify(reqQuery);
        // Create operators ($gt, $gte, etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
        // Finding resource
        let query = resourceModel_1.default.find(JSON.parse(queryStr)).populate('uploadedBy', 'name email avatar');
        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }
        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        }
        else {
            query = query.sort('-createdAt');
        }
        // Search
        if (req.query.search) {
            const searchQuery = {
                $or: [
                    { title: { $regex: req.query.search, $options: 'i' } },
                    { description: { $regex: req.query.search, $options: 'i' } },
                    { tags: { $in: [new RegExp(req.query.search, 'i')] } },
                ],
            };
            query = query.find(searchQuery);
        }
        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await resourceModel_1.default.countDocuments(query.getQuery());
        query = query.skip(startIndex).limit(limit);
        // Executing query
        const resources = await query;
        // Pagination result
        const pagination = {};
        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit,
            };
        }
        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit,
            };
        }
        res.status(200).json({
            success: true,
            count: resources.length,
            pagination,
            data: resources,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getResources = getResources;
// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Public
const getResource = async (req, res, next) => {
    try {
        const resource = await resourceModel_1.default.findById(req.params.id).populate('uploadedBy', 'name email avatar');
        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found',
            });
        }
        // Increment view count
        resource.viewCount += 1;
        await resource.save();
        res.status(200).json({
            success: true,
            data: resource,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getResource = getResource;
// @desc    Create new resource
// @route   POST /api/resources
// @access  Private
const createResource = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.uploadedBy = req.user.id;
        const resource = await resourceModel_1.default.create(req.body);
        res.status(201).json({
            success: true,
            data: resource,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createResource = createResource;
// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private
const updateResource = async (req, res, next) => {
    try {
        let resource = await resourceModel_1.default.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found',
            });
        }
        // Make sure user is resource owner or admin
        if (resource.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to update this resource`,
            });
        }
        resource = await resourceModel_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({
            success: true,
            data: resource,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateResource = updateResource;
// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private
const deleteResource = async (req, res, next) => {
    try {
        const resource = await resourceModel_1.default.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found',
            });
        }
        // Make sure user is resource owner or admin
        if (resource.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to delete this resource`,
            });
        }
        // Delete file from storage (S3 or local)
        if (process.env.STORAGE_TYPE === 's3') {
            // Delete from S3
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME || 'juniorq-resources',
                Key: resource.fileUrl.split('/').pop(),
            };
            try {
                await s3Client.send(new DeleteObjectCommand(params));
            }
            catch (error) {
                console.error('Error deleting file from S3:', error);
            }
        }
        else {
            // Delete local file
            const filePath = path_1.default.join(__dirname, `../../public/uploads/${resource.fileUrl}`);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
        }
        await resource.deleteOne({ _id: req.params.id });
        res.status(200).json({
            success: true,
            data: {},
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteResource = deleteResource;
// @desc    Upload file for resource
// @route   PUT /api/resources/:id/file
// @access  Private
const uploadResourceFile = async (req, res, next) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files were uploaded.',
            });
        }
        const file = req.files.file;
        const fileExt = path_1.default.extname(file.name).toLowerCase();
        const fileName = `${(0, uuid_1.v4)()}${fileExt}`;
        // Check file type
        const allowedFileTypes = [
            '.pdf',
            '.doc',
            '.docx',
            '.ppt',
            '.pptx',
            '.xls',
            '.xlsx',
            '.jpg',
            '.jpeg',
            '.png',
            '.mp4',
            '.mp3',
            '.zip',
        ];
        if (!allowedFileTypes.includes(fileExt)) {
            return res.status(400).json({
                success: false,
                message: `File type ${fileExt} is not allowed`,
            });
        }
        // Check file size (max 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            return res.status(400).json({
                success: false,
                message: 'File size exceeds the limit of 50MB',
            });
        }
        let fileUrl;
        // Upload to S3 if configured, otherwise save locally
        if (process.env.STORAGE_TYPE === 's3') {
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME || 'juniorq-resources',
                Key: fileName,
                Body: file.data,
                ContentType: file.mimetype,
                ACL: 'public-read',
            };
            const command = new client_s3_1.PutObjectCommand(params);
            await s3Client.send(command);
            fileUrl = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
        }
        else {
            // Save file locally
            const uploadPath = path_1.default.join(__dirname, '../../public/uploads');
            // Create uploads directory if it doesn't exist
            if (!fs_1.default.existsSync(uploadPath)) {
                fs_1.default.mkdirSync(uploadPath, { recursive: true });
            }
            const filePath = path_1.default.join(uploadPath, fileName);
            await file.mv(filePath);
            fileUrl = `/uploads/${fileName}`;
        }
        // Update resource with file URL and metadata
        const resource = await resourceModel_1.default.findByIdAndUpdate(req.params.id, {
            fileUrl,
            fileType: fileExt.replace('.', ''),
            fileSize: file.size,
        }, { new: true, runValidators: true });
        res.status(200).json({
            success: true,
            data: resource,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.uploadResourceFile = uploadResourceFile;
// @desc    Like a resource
// @route   PUT /api/resources/:id/like
// @access  Private
const likeResource = async (req, res, next) => {
    try {
        const resource = await resourceModel_1.default.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found',
            });
        }
        // Check if the resource has already been liked by this user
        if (resource.likes.includes(req.user.id)) {
            return res.status(400).json({
                success: false,
                message: 'Resource already liked',
            });
        }
        resource.likes.unshift(req.user.id);
        await resource.save();
        res.status(200).json({
            success: true,
            data: resource.likes,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.likeResource = likeResource;
// @desc    Unlike a resource
// @route   PUT /api/resources/:id/unlike
// @access  Private
const unlikeResource = async (req, res, next) => {
    try {
        const resource = await resourceModel_1.default.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found',
            });
        }
        // Check if the resource has been liked by this user
        if (!resource.likes.includes(req.user.id)) {
            return res.status(400).json({
                success: false,
                message: 'Resource has not yet been liked',
            });
        }
        // Get remove index
        const removeIndex = resource.likes.indexOf(req.user.id);
        resource.likes.splice(removeIndex, 1);
        await resource.save();
        res.status(200).json({
            success: true,
            data: resource.likes,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.unlikeResource = unlikeResource;
// @desc    Add comment to resource
// @route   POST /api/resources/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
    try {
        const { text } = req.body;
        const newComment = {
            text,
            user: req.user.id,
        };
        const resource = await resourceModel_1.default.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found',
            });
        }
        resource.comments.unshift(newComment);
        await resource.save();
        res.status(200).json({
            success: true,
            data: resource.comments,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addComment = addComment;
// @desc    Remove comment from resource
// @route   DELETE /api/resources/:id/comments/:comment_id
// @access  Private
const removeComment = async (req, res, next) => {
    try {
        const resource = await resourceModel_1.default.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found',
            });
        }
        // Find comment
        const comment = resource.comments.find((comment) => { var _a; return ((_a = comment._id) === null || _a === void 0 ? void 0 : _a.toString()) === req.params.comment_id; });
        // Make sure comment exists
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found',
            });
        }
        // Check user is comment owner or admin
        if (comment.user.toString() !== req.user.id &&
            req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this comment',
            });
        }
        // Get remove index
        const removeIndex = resource.comments.findIndex((comment) => { var _a; return ((_a = comment._id) === null || _a === void 0 ? void 0 : _a.toString()) === req.params.comment_id; });
        resource.comments.splice(removeIndex, 1);
        await resource.save();
        res.status(200).json({
            success: true,
            data: resource.comments,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.removeComment = removeComment;
