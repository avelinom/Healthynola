const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const config = require('../config/config');
const logger = require('../utils/logger');
const { protect } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'manager', 'cashier']).withMessage('Invalid role')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, email, password, role = 'cashier' } = req.body;

    // TODO: Check if user exists in database
    // TODO: Hash password
    // TODO: Create user in database
    // TODO: Generate JWT token

    // Placeholder response
    res.status(201).json({
      success: true,
      message: 'User registration endpoint - not implemented yet',
      data: { name, email, role }
    });

    logger.info(`User registration attempted for email: ${email}`);
  } catch (error) {
    next(error);
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user in database
    const user = await db('users')
      .where({ email })
      .first();

    if (!user) {
      logger.warn(`Login failed: user not found for email ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Check if user is active
    if (!user.active) {
      logger.warn(`Login failed: user ${email} is inactive`);
      return res.status(401).json({
        success: false,
        error: 'Usuario inactivo. Contacta al administrador.'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      logger.warn(`Login failed: incorrect password for email ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Update last_login
    await db('users')
      .where({ id: user.id })
      .update({ last_login: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    logger.info(`Login successful for user: ${email}`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    // Get fresh user data from database
    const user = await db('users')
      .where({ id: req.user.id })
      .select('id', 'name', 'email', 'role', 'active', 'last_login')
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    if (!user.active) {
      return res.status(403).json({
        success: false,
        error: 'Usuario inactivo'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.last_login
      }
    });
  } catch (error) {
    logger.error('Get user error:', error);
    next(error);
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.json({
    success: true,
    message: 'User logged out successfully'
  });
});

module.exports = router;
