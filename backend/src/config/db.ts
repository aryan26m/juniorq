import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/juniorq';
  
  // Enable Mongoose debugging
  mongoose.set('debug', true);
  
  // Connection options - using type assertion for compatibility
  const options = {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  } as mongoose.ConnectOptions;

  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(mongoUri, options);
    
    // Log successful connection
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Safely get database name
    const dbName = conn.connection.db ? conn.connection.db.databaseName : 'unknown';
    console.log(`📊 Database: ${dbName}`);
    
    // Connection events
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to DB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected');
    });
    
    return conn;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    console.log('MongoDB URI:', mongoUri.replace(/(mongodb\+srv:\/\/)([^:]+):([^@]+)@/, '$1***:***@'));
    process.exit(1);
  }
};

export { connectDB };
