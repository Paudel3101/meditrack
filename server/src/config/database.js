const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'sql.freedb.tech',
  user: process.env.DB_USER || 'meditrack_user',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'meditrack_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 10000
};

module.exports = { dbConfig };
