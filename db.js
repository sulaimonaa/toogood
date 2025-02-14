const mysql = require('mysql2')

const db = mysql.createPool({
    connectionLimit: 10, // Allows multiple connections
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


db.query('SELECT 1', (err) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL successfully.");
    }
});

module.exports = db;