// Deep debug of User model issue
require('dotenv').config();
const mongoose = require('mongoose');

async function debugUserModel() {
  console.log('🔍 Deep Debugging User Model...\n');
  
  // Connect first
  await mongoose.connect(process.env.DB_CONNECTION || 'mongodb://localhost:27017/test');
  console.log('✅ Connected to MongoDB\n');
  
  // Clear cache
  delete require.cache[require.resolve('./models/User.model')];
  delete require.cache[require.resolve('./user.model')];
  
  console.log('1. Loading User model file directly...');
  try {
    const fs = require('fs');
    const modelCode = fs.readFileSync('./models/User.model.js', 'utf8');
    console.log('   ✅ File read successfully');
    console.log('   File length:', modelCode.length, 'characters');
    console.log('   Last 200 chars:', modelCode.slice(-200));
    console.log('');
    
    // Check if model export line exists
    if (modelCode.includes('module.exports = User')) {
      console.log('   ✅ module.exports found');
    } else {
      console.log('   ❌ module.exports NOT found!');
    }
    
    if (modelCode.includes("mongoose.model('User'")) {
      console.log('   ✅ mongoose.model found');
    } else {
      console.log('   ❌ mongoose.model NOT found!');
    }
    console.log('');
  } catch (err) {
    console.error('   ❌ Error reading file:', err.message);
  }
  
  console.log('2. Executing User model file...');
  try {
    // Manually execute the model creation
    const Schema = mongoose.Schema;
    const bcrypt = require('bcrypt');
    
    const userSchema = new Schema({
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true }
    });
    
    const TestUser = mongoose.model('TestUser', userSchema);
    console.log('   ✅ TestUser model created successfully');
    console.log('   TestUser type:', typeof TestUser);
    console.log('   TestUser constructor:', TestUser.constructor.name);
    console.log('   TestUser.findOne:', typeof TestUser.findOne);
    console.log('');
    
    // Now try to get the actual User model
    console.log('3. Checking if User model exists in mongoose.models...');
    console.log('   Available models:', Object.keys(mongoose.models));
    console.log('');
    
    console.log('4. Requiring User model...');
    const User = require('./models/User.model');
    console.log('   User type:', typeof User);
    console.log('   User constructor:', User.constructor.name);
    console.log('   User keys count:', Object.keys(User).length);
    console.log('   User in mongoose.models:', 'User' in mongoose.models);
    
    if ('User' in mongoose.models) {
      console.log('   ✅ User model exists in mongoose.models');
      const UserFromMongoose = mongoose.models.User;
      console.log('   UserFromMongoose type:', typeof UserFromMongoose);
      console.log('   UserFromMongoose.findOne:', typeof UserFromMongoose.findOne);
    } else {
      console.log('   ❌ User model NOT in mongoose.models');
    }
    console.log('');
    
    console.log('5. Comparing with Property model...');
    const Property = require('./models/Property.model');
    console.log('   Property type:', typeof Property);
    console.log('   Property constructor:', Property.constructor.name);
    console.log('   Property.findOne:', typeof Property.findOne);
    console.log('   Property in mongoose.models:', 'Property' in mongoose.models);
    console.log('');
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('   ❌ Error:', err.message);
    console.error('   Stack:', err.stack);
  }
}

debugUserModel().catch(console.error);

