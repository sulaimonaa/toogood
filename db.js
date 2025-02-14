const mysql = require('mysql2')

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 20,
    queueLimit: 0,
    keepAliveInitialDelay: 10000,
    waitForConnections: true,
    enableKeepAlive: true,
});


db.query('SELECT 1', (err) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL successfully.");
    }
});

module.exports = db;