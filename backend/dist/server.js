"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./config/db");
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const assignmentRoutes_1 = __importDefault(require("./routes/assignmentRoutes"));
const resourceRoutes_1 = __importDefault(require("./routes/resourceRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
// Add debug logging
console.log('=== Starting JuniorQ Backend ===');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Node Version:', process.version);
console.log('Current Directory:', process.cwd());
// Load environment variables
dotenv_1.default.config();
// Initialize Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
// File uploads
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../public/uploads')));
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/assignments', assignmentRoutes_1.default);
app.use('/api/resources', resourceRoutes_1.default);
// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'JuniorQ API is running',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});
// Handle 404
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Resource not found' });
});
// Error handling middleware
app.use(errorMiddleware_1.errorHandler);
// Connect to MongoDB and start server
const startServer = async () => {
    try {
        console.log('\n=== Starting MongoDB Connection ===');
        await (0, db_1.connectDB)();
        console.log('\n=== Starting Express Server ===');
        const server = app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`📡 API URL: http://localhost:${PORT}`);
            console.log('\n=== Server Started Successfully ===');
        });
        // Handle server errors
        server.on('error', (error) => {
            if (error.syscall !== 'listen')
                throw error;
            // Handle specific listen errors with friendly messages
            switch (error.code) {
                case 'EACCES':
                    console.error(`Port ${PORT} requires elevated privileges`);
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    console.error(`Port ${PORT} is already in use`);
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        });
    }
    catch (error) {
        console.error('\n❌ Failed to start server:', error);
        process.exit(1);
    }
};
// Start the server
console.log('\n=== Initializing Server ===');
startServer();
exports.default = app;
