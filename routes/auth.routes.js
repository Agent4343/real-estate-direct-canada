const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { validateRegistration, validateLogin } = require('../middleware/validation');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { firstName, lastName, email, password, province, city, phone, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already registered with this email.' });
    }

    // Create new user
    const userData = {
      firstName,
      lastName,
      email,
      password,
      role: role || 'Buyer',
      province,
      city,
      phone
    };

    const user = new User(userData);
    await user.save();

    // Check if SECRET_KEY is set
    if (!process.env.SECRET_KEY) {
      console.error('SECRET_KEY is not set in environment variables');
      return res.status(500).json({ 
        message: 'Server configuration error. Please contact support.',
        error: 'SECRET_KEY not configured'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        role: user.role
      }, 
      process.env.SECRET_KEY,
      { expiresIn: '7d' }
    );

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Registration error:', err);
    console.error('Error name:', err.name);
    console.error('Error code:', err.code);
    console.error('Error stack:', err.stack);
    
    // Provide more detailed error information
    let errorMessage = 'Registration failed';
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message).join(', ');
      errorMessage = `Validation error: ${validationErrors}`;
    } else if (err.code === 11000) {
      errorMessage = 'Email already registered with this account';
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    res.status(500).json({ 
      message: errorMessage,
      error: err.message || 'Unknown error',
      errorType: err.name || 'Error',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Check password
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Check if account is active
    if (user.status === 'Suspended') {
      return res.status(403).json({ message: 'Account is suspended. Please contact support.' });
    }

    // Update login info
    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.SECRET_KEY,
      { expiresIn: '7d' }
    );

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      message: 'Login failed', 
      error: err.message 
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(user);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
});

module.exports = router;

