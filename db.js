const mysql = require('mysql2');

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

db.query('SELECT 1', (err, results) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL successfully.");
    }
});

function keepDBAlive() {
    db.query("SELECT 1", (err, results) => {
        if (err) {
            console.error("Database ping failed:", err.message);
        } else {
            console.log("Database connection active:", results);
        }
    });
}

setInterval(keepDBAlive, 5 * 60 * 1000);

module.exports = db;
