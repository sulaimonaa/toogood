const jwt = require('jsonwebtoken');
const db = require('../db');
const JWT_SECRET = process.env.SECRET_KEY; 

const authenticateAdmin = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
        req.admin = decoded; 

        const sql = "SELECT * FROM admin_users WHERE id = ?";
        db.query(sql, [decoded.admin_id], (err, results) => {
            if (err || results.length === 0) {
                return res.status(403).json({ message: "Unauthorized access" });
            }
            next();
        });
    } catch (err) {
        res.status(400).json({ message: "Invalid token" });
    }
};

module.exports = authenticateAdmin;
