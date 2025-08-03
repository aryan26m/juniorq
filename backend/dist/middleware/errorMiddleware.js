"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const errors = {};
        if (err.errors) {
            Object.keys(err.errors).forEach((key) => {
                var _a, _b;
                errors[key] = ((_b = (_a = err.errors) === null || _a === void 0 ? void 0 : _a[key]) === null || _b === void 0 ? void 0 : _b.message) || 'Invalid field';
            });
        }
        return res.status(statusCode).json({
            success: false,
            message: 'Validation Error',
            errors,
        });
    }
    // Handle duplicate key errors
    if (err.code === 11000) {
        statusCode = 400;
        const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
        message = `${field} already exists`;
    }
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
