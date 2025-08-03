import mongoose from 'mongoose';

// Enable Mongoose debug mode
mongoose.set('debug', true);

async function testDB() {
  console.log('=== Testing MongoDB Connection ===');
  console.log('Mongoose version:', mongoose.version);
  
  // Connection options with more detailed settings
  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    family: 4, // Force IPv4
  } as mongoose.ConnectOptions;

  console.log('\n=== Connection Details ===');
  console.log('MongoDB URI: mongodb://127.0.0.1:27017/juniorq');
  console.log('Connection options:', JSON.stringify(options, null, 2));
  
  try {
    console.log('\n=== Attempting to connect... ===');
    const startTime = Date.now();
    
    // Set up event listeners
    mongoose.connection.on('connecting', () => {
      console.log('Mongoose connecting to MongoDB...');
    });

    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from MongoDB');
    });

    // Attempt to connect
    const conn = await mongoose.connect(
      'mongodb://127.0.0.1:27017/juniorq?directConnection=true',
      options
    );
    
    const connectionTime = Date.now() - startTime;
    console.log('\n✅ MongoDB Connected Successfully!');
    console.log(`Connection established in ${connectionTime}ms`);
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Port: ${conn.connection.port}`);
    console.log(`Database: ${conn.connection.db?.databaseName || 'unknown'}`);
    
    // List all collections
    try {
      const collections = await conn.connection.db.listCollections().toArray();
      console.log('\n=== Collections ===');
      console.log(collections.map(c => c.name).join(', ') || 'No collections found');
    } catch (colError) {
      console.warn('Could not list collections:', colError);
    }
    
    // Close the connection
    console.log('\nClosing connection...');
    await mongoose.connection.close();
    console.log('✅ Connection closed');
    
  } catch (error) {
    console.error('\n❌ MongoDB Connection Error:');
    console.error(error);
    
    if (error instanceof Error) {
      console.error('\nError Details:');
      console.error('Name:', error.name);
      console.error('Message:', error.message);
      if ('code' in error) console.error('Code:', (error as any).code);
      if ('codeName' in error) console.error('Code Name:', (error as any).codeName);
    }
    
    process.exit(1);
  }
}

testDB();
