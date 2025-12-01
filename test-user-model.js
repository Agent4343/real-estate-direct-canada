// Diagnostic test for User model
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.model');

async function testUserModel() {
  console.log('🔍 Testing User Model...\n');

  // Check if User is defined
  console.log('1. Checking if User is defined:');
  if (typeof User === 'undefined') {
    console.log('   ❌ User is undefined\n');
    return;
  }
  console.log('   ✅ User is defined');
  console.log('   Type:', typeof User);
  console.log('   Constructor:', User.constructor.name);
  console.log('');

  // Check if User has findOne method
  console.log('2. Checking if User has findOne method:');
  if (typeof User.findOne === 'function') {
    console.log('   ✅ User.findOne is a function\n');
  } else {
    console.log('   ❌ User.findOne is NOT a function');
    console.log('   User.findOne type:', typeof User.findOne);
    console.log('   Available methods:', Object.getOwnPropertyNames(User).filter(name => typeof User[name] === 'function').slice(0, 10));
    console.log('');
  }

  // Try to connect to database
  console.log('3. Testing database connection:');
  try {
    await mongoose.connect(process.env.DB_CONNECTION || 'mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('   ✅ Connected to MongoDB\n');

    // Try to use User model
    console.log('4. Testing User.findOne:');
    try {
      const result = await User.findOne({ email: 'nonexistent@test.com' });
      console.log('   ✅ User.findOne worked! Result:', result === null ? 'null (no user found)' : 'user found');
    } catch (err) {
      console.log('   ❌ User.findOne failed:', err.message);
    }
    console.log('');

    // Try to create a user
    console.log('5. Testing User model creation:');
    try {
      const testUser = new User({
        firstName: 'Test',
        lastName: 'User',
        email: `test_${Date.now()}@test.com`,
        password: 'Test1234',
        province: 'ON',
        role: 'Buyer'
      });
      console.log('   ✅ User instance created successfully');
      console.log('   User ID:', testUser._id ? 'Generated' : 'Not generated');
      
      // Don't actually save to avoid polluting database
      console.log('   (Not saving to avoid database pollution)');
    } catch (err) {
      console.log('   ❌ Failed to create User instance:', err.message);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.log('   ❌ Database connection failed:', err.message);
    console.log('   Make sure MongoDB is running and DB_CONNECTION is set in .env');
  }
}

testUserModel().catch(console.error);

