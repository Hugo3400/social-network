const { Pool } = require('pg');

let pool = null;

const initDatabase = (config) => {
  pool = new Pool({
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

  return pool;
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return pool;
};

const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

const testConnection = async (config) => {
  try {
    const testPool = new Pool({
      host: config.host,
      port: config.port,
      database: config.name,
      user: config.user,
      password: config.password,
      connectionTimeoutMillis: 5000,
    });

    await testPool.query('SELECT NOW()');
    await testPool.end();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  initDatabase,
  getPool,
  query,
  testConnection
};
