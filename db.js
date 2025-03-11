const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  connectTimeout: 30000,
  connectionLimit: 20,
  queueLimit: 0,
  keepAliveInitialDelay: 30000,
  waitForConnections: true,
  enableKeepAlive: true,
});

async function testConnection() {
  try {
    const [rows] = await db.query('SELECT 1');
    console.log("Connected to MySQL successfully:", rows);
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
}

// Test initial connection
testConnection();

async function keepDBAlive() {
  try {
    const [rows] = await db.query("SELECT 1");
    console.log("Database connection active:", rows);
  } catch (error) {
    console.error("Database ping failed:", error.message);
  }
}

// Keep the DB connection alive every 5 minutes
setInterval(keepDBAlive, 5 * 60 * 1000);

module.exports = db;
