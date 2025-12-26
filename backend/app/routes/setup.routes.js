const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Pool } = require('pg');
const mysql = require('mysql2/promise');

// Test database connection (supports PostgreSQL and MySQL)
router.post('/test-db', async (req, res) => {
  const { type, host, port, name, user, password } = req.body;
  const dbType = type || 'postgresql';

  try {
    if (dbType === 'mysql') {
      const pool = mysql.createPool({
        host,
        port: parseInt(port),
        database: name,
        user,
        password,
        connectionLimit: 1,
        connectTimeout: 5000
      });

      await pool.query('SELECT 1');
      await pool.end();
    } else {
      const pool = new Pool({
        host,
        port: parseInt(port),
        database: name,
        user,
        password,
        connectionTimeoutMillis: 5000,
      });

      await pool.query('SELECT NOW()');
      await pool.end();
    }

    res.json({ success: true, message: 'Database connection successful' });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Database connection failed',
      details: error.message
    });
  }
});

// Initialize database schema (supports PostgreSQL and MySQL)
router.post('/init-db', async (req, res) => {
  const { type, host, port, name, user, password } = req.body;
  const dbType = type || 'postgresql';

  try {
    let pool;
    let schemaPath;

    if (dbType === 'mysql') {
      pool = mysql.createPool({
        host,
        port: parseInt(port),
        database: name,
        user,
        password,
        multipleStatements: true
      });
      schemaPath = path.join(__dirname, '..', 'db', 'schema-mysql.sql');
    } else {
      pool = new Pool({
        host,
        port: parseInt(port),
        database: name,
        user,
        password,
      });
      schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    }

    // Read schema file
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    if (dbType === 'mysql') {
      await pool.query(schema);
      await pool.end();
    } else {
      await pool.query(schema);
      await pool.end();
    }

    res.json({ success: true, message: 'Database initialized successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to initialize database',
      details: error.message
    });
  }
});

// Create admin user
router.post('/create-admin', async (req, res) => {
  const { dbConfig, adminData } = req.body;

  try {
    const pool = new Pool({
      host: dbConfig.host,
      port: parseInt(dbConfig.port),
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    // Hash password
    const passwordHash = await bcrypt.hash(adminData.password, 10);

    // Insert admin user
    const query = `
      INSERT INTO users (username, email, password_hash, first_name, last_name, is_admin, is_active)
      VALUES ($1, $2, $3, $4, $5, true, true)
      RETURNING id, username, email
    `;

    const result = await pool.query(query, [
      adminData.username,
      adminData.email,
      passwordHash,
      adminData.firstName || 'Admin',
      adminData.lastName || 'User'
    ]);

    // Create profile for admin
    await pool.query(
      'INSERT INTO user_profiles (user_id) VALUES ($1)',
      [result.rows[0].id]
    );

    await pool.end();

    res.json({
      success: true,
      message: 'Admin user created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create admin user',
      details: error.message
    });
  }
});

// Save configuration
router.post('/save-config', async (req, res) => {
  const config = req.body;

  try {
    // Generate JWT secret if not provided
    if (!config.security.jwtSecret || config.security.jwtSecret === 'REPLACE_WITH_RANDOM_SECRET') {
      config.security.jwtSecret = crypto.randomBytes(64).toString('hex');
    }

    // Save config.json
    const configPath = path.join(__dirname, '..', '..', 'config', 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    // Save .env file
    const envPath = path.join(__dirname, '..', '..', '.env');
    const envContent = `
# Server Configuration
PORT=${config.server.port}
NODE_ENV=production

# Database Configuration
DB_TYPE=${config.database.type}
DB_HOST=${config.database.host}
DB_PORT=${config.database.port}
DB_NAME=${config.database.name}
DB_USER=${config.database.user}
DB_PASSWORD=${config.database.password}

# Security
JWT_SECRET=${config.security.jwtSecret}
JWT_EXPIRATION=${config.security.jwtExpiration}
BCRYPT_ROUNDS=${config.security.bcryptRounds}

# Upload Settings
MAX_FILE_SIZE=${config.uploads.maxFileSize}
ALLOWED_FILE_TYPES=${config.uploads.allowedTypes.join(',')}

# Modules
MODULE_FEED=${config.modules.feed}
MODULE_GROUPS=${config.modules.groups}
MODULE_PROFILES=${config.modules.profiles}
MODULE_MESSAGING=${config.modules.messaging}
MODULE_NOTIFICATIONS=${config.modules.notifications}
`.trim();

    fs.writeFileSync(envPath, envContent);

    res.json({
      success: true,
      message: 'Configuration saved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to save configuration',
      details: error.message
    });
  }
});

// Check if system is configured
router.get('/status', (req, res) => {
  const configPath = path.join(__dirname, '..', '..', 'config', 'config.json');
  const isConfigured = fs.existsSync(configPath);

  res.json({
    configured: isConfigured
  });
});

module.exports = router;
