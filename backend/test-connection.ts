import { connectDB } from './src/config/db';

async function testConnection() {
  console.log('Starting connection test...');
  try {
    await connectDB();
    console.log('✅ Connection test successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    process.exit(1);
  }
}

testConnection();
