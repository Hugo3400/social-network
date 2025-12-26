const { Pool: PgPool } = require('pg');
const mysql = require('mysql2/promise');

let pool = null;
let dbType = 'postgresql';

const initDatabase = (config) => {
  dbType = config.type || 'postgresql';
  
  if (dbType === 'mysql') {
    pool = mysql.createPool({
      host: config.host,
      port: config.port,
      database: config.name,
      user: config.user,
      password: config.password,
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0,
      connectTimeout: 10000
    });
  } else {
    pool = new PgPool({
      host: config.host,
      port: config.port,
      database: config.name,
      user: config.user,
      password: config.password,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
    });
  }

  return pool;
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return pool;
};

const query = async (text, params) => {
  if (dbType === 'mysql') {
    // Convert PostgreSQL $1, $2 placeholders to MySQL ? placeholders
    const mysqlQuery = text.replace(/\$(\d+)/g, '?');
    const [rows] = await pool.query(mysqlQuery, params);
    return { rows };
  } else {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }
};

const testConnection = async (config) => {
  try {
    const type = config.type || 'postgresql';
    
    if (type === 'mysql') {
      const testPool = mysql.createPool({
        host: config.host,
        port: config.port,
        database: config.name,
        user: config.user,
        password: config.password,
        connectionLimit: 1,
        connectTimeout: 5000
      });

      await testPool.query('SELECT 1');
      await testPool.end();
    } else {
      const testPool = new PgPool({
        host: config.host,
        port: config.port,
        database: config.name,
        user: config.user,
        password: config.password,
        connectionTimeoutMillis: 5000,
      });

      await testPool.query('SELECT NOW()');
      await testPool.end();
    }

    return { success: true };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  initDatabase,
  getPool,
  query,
  testConnection,
  getDbType: () => dbType
};
