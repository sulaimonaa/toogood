const express = require('express');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const verifyToken = require('../middlewares/authMiddleware');
const nodemailer = require("nodemailer"); 
const router = express.Router();

const JWT_SECRET = process.env.SECRET_KEY;

const transporter = nodemailer.createTransport({
    host: "mail.toogoodtravels.net",
    port: 465, 
    secure: true,
    auth: {
        user: "noreply@toogoodtravels.net", 
        pass: process.env.EMAIL_PASSKEY,
    },
});
// Agent Registration Route (Checks for duplicate email)
router.post('/register', async (req, res) => {
    try {
        const { agent_name, agent_phone, agent_email, agent_password } = req.body;

        if (!agent_name || !agent_phone || !agent_email || !agent_password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if email already exists
        const checkEmailSQL = "SELECT * FROM agent_details WHERE agent_email = ?";
        db.query(checkEmailSQL, [agent_email], async (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error" });
            }

            if (results.length > 0) {
                return res.status(400).json({ message: "Email already exists" });
            }

            // If email is unique, proceed with registration
            const hashedPassword = await bcrypt.hash(agent_password, 10);
            const insertSQL = "INSERT INTO agent_details (agent_name, agent_phone, agent_email, agent_password) VALUES (?, ?, ?, ?)";
            db.query(insertSQL, [agent_name, agent_phone, agent_email, hashedPassword], (err, result) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ message: "Error registering agent" });
                }

                // Email content
            const mailOptions = {
                from: '"Too Good Travels" <noreply@toogoodtravels.net>',
                to: agent_email,
                subject: "Your Agent Registration is Successful",
                html: `
                    <div style="padding: 20px; font-family: Arial, sans-serif; background-color: #f8f8f8; border-radius: 5px;">
                        <h2 style="color: #333;">Dear ${agent_name},</h2>
                        <p style="color: #555;">Thank you for registering to become an agent with Too Good Travels.</p>

                        <div style="background-color: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
                            <h3 style="color: #333;">Application Details:</h3>
                            <ul style="padding-left: 20px;">
                                <li><strong>Full Name:</strong> ${agent_name}</li>
                                <li><strong>Phone Number:</strong> ${agent_phone}</li>
                                <li><strong>Email:</strong> ${agent_email}</li>
                                <li><strong>Password:</strong> ${agent_password}</li>
                            </ul>
                        </div>

                        <p style="color: #555; margin-top: 20px;">Thank you for your registration, we will get back to you soon.</p>
                        <p style="color: #333; margin-bottom: 0"><strong>Best regards,</strong></p>
                        <p style="color: #333;"><strong>Too Good Travels</strong></p>
                    </div>
                `,
            };

            // Send email inside the callback function
            transporter.sendMail(mailOptions, (emailError, info) => {
                if (emailError) {
                    console.error("Email sending error:", emailError);
                } else {
                    console.log("Email sent successfully:", info.response);
                }
            });
                res.json({ success: "Agent registration successful" });
            });
        });

    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Agent Login Route
router.post('/login', (req, res) => {
    const { agent_email, agent_password } = req.body;

    if (!agent_email || !agent_password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const sql = "SELECT * FROM agent_details WHERE agent_email = ?";
    db.query(sql, [agent_email], async (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const agent = results[0];
        const passwordMatch = await bcrypt.compare(agent_password, agent.agent_password);

        if (agent.status !== 'approved') {
            return res.status(403).json({ message: "Your account is pending approval" });
        }

        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ agent_id: agent.id, agent_email: agent.agent_email }, JWT_SECRET, { expiresIn: "1h" });

        res.json({ success: "Login successful", token });
    });
});

// Password Reset Route
router.post('/reset-password', async (req, res) => {
    try {
        const { agent_email, new_password } = req.body;

        if (!agent_email || !new_password) {
            return res.status(400).json({ message: "Email and new password are required" });
        }

        // Check if email exists
        const checkEmailSQL = "SELECT * FROM agent_details WHERE agent_email = ?";
        db.query(checkEmailSQL, [agent_email], async (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error" });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "Email not found" });
            }

            // Hash new password and update in DB
            const hashedPassword = await bcrypt.hash(new_password, 10);
            const updateSQL = "UPDATE agent_details SET agent_password = ? WHERE agent_email = ?";
            db.query(updateSQL, [hashedPassword, agent_email], (err, result) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ message: "Error updating password" });
                }
                res.json({ success: "Password reset successful" });
            });
        });

    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

const authenticateAdmin = require("../middlewares/adminAuth");
router.get('/pending', authenticateAdmin, (req, res) => {
    const sql = "SELECT id, agent_name, agent_email FROM agent_details WHERE status = 'pending'";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

router.get('/approved', authenticateAdmin, (req, res) => {
    const sql = "SELECT id, agent_name, agent_email FROM agent_details WHERE status = 'approved'";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

router.get('/denied', authenticateAdmin, (req, res) => {
    const sql = "SELECT id, agent_name, agent_email FROM agent_details WHERE status = 'denied'";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

router.get('/all-agent', authenticateAdmin, (req, res) => {
    const sql = "SELECT id, agent_name, agent_email, status FROM agent_details";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

const authenticateAgent = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        req.agent = decoded; // Store agent details in request
        next();
    });
};

// Route to Get Agent Details (Protected)
router.get('/details', authenticateAgent, (req, res) => {
    const agent_id = req.agent.agent_id; // Extracted from JWT

    db.query("SELECT agent_name, agent_phone, agent_email FROM agent_details WHERE id = ?", [agent_id], 
    (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Agent not found" });
        }

        res.json(results[0]);
    });
});

// Update Agent Details Route (Protected)
router.put('/update', authenticateAgent, async (req, res) => {
    const { agent_name, agent_phone, agent_password } = req.body;
    const agent_id = req.agent.agent_id; // Extracted from JWT

    if (!agent_name && !agent_phone && !agent_password) {
        return res.status(400).json({ message: "At least one field must be provided to update" });
    }

    try {
        // Step 1: Fetch current details
        db.query("SELECT * FROM agent_details WHERE id = ?", [agent_id], async (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "Agent not found" });
            }

            const agent = results[0];
            let updateFields = [];
            let values = [];

            // Step 2: Only update if new value is provided and different from current one
            if (agent_name && agent_name !== agent.agent_name) {
                updateFields.push("agent_name = ?");
                values.push(agent_name);
            }
            if (agent_phone && agent_phone !== agent.agent_phone) {
                updateFields.push("agent_phone = ?");
                values.push(agent_phone);
            }
            if (agent_password) {
                const passwordMatch = await bcrypt.compare(agent_password, agent.agent_password);
                if (!passwordMatch) {
                    const hashedPassword = await bcrypt.hash(agent_password, 10);
                    updateFields.push("agent_password = ?");
                    values.push(hashedPassword);
                }
            }

            if (updateFields.length === 0) {
                return res.json({ message: "No changes detected" });
            }

            // Step 3: Execute update query
            values.push(agent_id);
            const sql = `UPDATE agent_details SET ${updateFields.join(", ")} WHERE id = ?`;

            db.query(sql, values, (updateErr, result) => {
                if (updateErr) {
                    console.error("Update error:", updateErr);
                    return res.status(500).json({ message: "Error updating agent details" });
                }
                res.json({ success: "Agent details updated successfully" });
            });
        });

    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get agent profile image
router.get('/agent-profile', verifyToken, (req, res) => {
    const agentId = req.user.agent_id;

    const sql = "SELECT agent_image FROM agent_details WHERE id = ?";
    db.query(sql, [agentId], (err, result) => {
        if (err) {
            console.error("Error fetching agent profile:", err);
            return res.status(500).json({ message: "Server error" });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Agent not found" });
        }

        res.json({ agent_image: result[0].agent_image });
    });
});

// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); 
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Upload agent profile image
router.post("/upload-agent-profile", authenticateAgent, upload.single("agent_image"), async (req, res) => {
    try {
        const agentId = req.agent.agent_id; 

        if (!agentId) {
            return res.status(404).json({ message: "Agent not found" });
        }

        // Image file path
        const imagePath = `/uploads/${req.file.filename}`;

        // Update agent image in database
        const [result] = await db.promise().query("UPDATE agent_details SET agent_image = ? WHERE id = ?", [imagePath, agentId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Agent not found" });
        }

        res.json({ message: "File uploaded successfully", filePath: imagePath });

    } catch (error) {
        console.error("Error uploading agent image:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
