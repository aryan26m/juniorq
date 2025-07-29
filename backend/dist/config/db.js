"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/juniorq';
    // Enable Mongoose debugging
    mongoose_1.default.set('debug', true);
    // Connection options - using type assertion for compatibility
    const options = {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };
    try {
        console.log('Connecting to MongoDB...');
        const conn = await mongoose_1.default.connect(mongoUri, options);
        // Log successful connection
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        // Safely get database name
        const dbName = conn.connection.db ? conn.connection.db.databaseName : 'unknown';
        console.log(`📊 Database: ${dbName}`);
        // Connection events
        mongoose_1.default.connection.on('connected', () => {
            console.log('Mongoose connected to DB');
        });
        mongoose_1.default.connection.on('error', (err) => {
            console.error('Mongoose connection error:', err);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.log('Mongoose disconnected');
        });
        return conn;
    }
    catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
        console.log('MongoDB URI:', mongoUri.replace(/(mongodb\+srv:\/\/)([^:]+):([^@]+)@/, '$1***:***@'));
        process.exit(1);
    }
};
exports.connectDB = connectDB;
