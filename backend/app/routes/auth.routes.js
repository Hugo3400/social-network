const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db/database');
const config = require('../../config/config.json');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: 'User with this username or email already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, config.security.bcryptRounds);

    // Create user
    const result = await query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email, first_name, last_name, avatar_url, created_at`,
      [username, email, passwordHash, firstName, lastName]
    );

    const user = result.rows[0];

    // Create profile
    await query('INSERT INTO user_profiles (user_id) VALUES ($1)', [user.id]);

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      config.security.jwtSecret,
      { expiresIn: config.security.jwtExpiration }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const result = await query(
      `SELECT id, username, email, password_hash, first_name, last_name, 
              avatar_url, is_admin, is_active
       FROM users
       WHERE username = $1 OR email = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, isAdmin: user.is_admin },
      config.security.jwtSecret,
      { expiresIn: config.security.jwtExpiration }
    );

    // Remove password hash from response
    delete user.password_hash;

    res.json({
      message: 'Login successful',
      user,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, config.security.jwtSecret);

    // Get user data
    const result = await query(
      `SELECT id, username, email, first_name, last_name, avatar_url, is_admin
       FROM users
       WHERE id = $1 AND is_active = true`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({
      valid: true,
      user: result.rows[0]
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
