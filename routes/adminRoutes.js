const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

const JWT_SECRET = process.env.SECRET_KEY; 

// Agent Registration Route (Checks for duplicate email)
router.post('/register', async (req, res) => {
    try {
        const { admin_name, admin_email, admin_password } = req.body;

        if (!admin_name || !admin_email || !admin_password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if email already exists
        const checkEmailSQL = "SELECT * FROM admin_users WHERE admin_email = ?";
        db.query(checkEmailSQL, [admin_email], async (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error" });
            }

            if (results.length > 0) {
                return res.status(400).json({ message: "Email already exists" });
            }

            // If email is unique, proceed with registration
            const hashedPassword = await bcrypt.hash(admin_password, 10);
            const insertSQL = "INSERT INTO admin_users (admin_name, admin_email, admin_password) VALUES (?, ?, ?)";
            db.query(insertSQL, [admin_name, admin_email, hashedPassword], (err, result) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ message: "Error registering agent" });
                }
                res.json({ success: "Admin registration successful" });
            });
        });

    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Admin Login Route
router.post('/login', (req, res) => {
    const { admin_email, admin_password } = req.body;

    if (!admin_email || !admin_password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const sql = "SELECT * FROM admin_users WHERE admin_email = ?";
    db.query(sql, [admin_email], async (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const admin = results[0];
        const passwordMatch = await bcrypt.compare(admin_password, admin.admin_password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials or password mismatch" });
        }

        const token = jwt.sign(
            { admin_id: admin.id, admin_email: admin.admin_email },
            JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({ success: "Login successful", token });
    });
});

const authenticateAdmin = require('../middlewares/adminAuth');

// Approve or Reject an Agent
router.put('/approve-agent/:agent_id', authenticateAdmin, (req, res) => {
    const { agent_id } = req.params;
    const { status } = req.body; // 'approved' or 'pending'

    if (!['approved', 'pending'].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    const sql = "UPDATE agent_details SET status = ? WHERE id = ?";
    db.query(sql, [status, agent_id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error updating agent status" });
        }
        res.json({ success: `Agent ${status} successfully` });
    });
});

// Delete an Agent
router.delete('/delete-agent/:agent_id', authenticateAdmin, (req, res) => {
    const { agent_id } = req.params;

    const sql = "DELETE FROM agent_details WHERE id = ?";
    db.query(sql, [agent_id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error deleting agent" });
        }
        res.json({ success: "Agent deleted successfully" });
    });
});

// Update payment status
router.put('/payment-update/:visa_id', authenticateAdmin, (req, res) => {
    const { visa_id } = req.params;
    const { status } = req.body; // 'Paid'

    if (!['Paid'].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    const sql = "UPDATE visa_applications SET payment_status = ? WHERE id = ?";
    db.query(sql, [status, visa_id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error updating agent status" });
        }
        res.json({ success: `Payment updated ${status} successfully` });
    });
});

router.put('/visa-payment-update/:visa_id', authenticateAdmin, (req, res) => {
    const { visa_id } = req.params;
    const { payment_status } = req.body; // 'Paid'

    if (!['Paid'].includes(payment_status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    const sql = "UPDATE visa_bookings SET payment_status = ? WHERE id = ?";
    db.query(sql, [payment_status, visa_id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error updating agent status" });
        }
        res.json({ success: `Payment updated ${payment_status} successfully` });
    });
});

router.get('/total-paid-vs-fees', (req, res) => {
    const sql = "SELECT SUM(amount_to_pay) AS total_paid_fees FROM visa_bookings WHERE payment_status = 'Paid'";
    
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error fetching total visa fees" });
        }
        res.json({ total_paid_fees: result[0].total_paid_fees });
    });
});
router.get('/total-not-paid-vs-fees', (req, res) => {
    const sql = "SELECT SUM(amount_to_pay) AS total_paid_fees FROM visa_bookings WHERE payment_status = 'Pending'";
    
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error fetching total visa fees" });
        }
        res.json({ total_paid_fees: result[0].total_paid_fees });
    });
});

router.put('/visa-update/:visa_id', authenticateAdmin, (req, res) => {
    const { visa_id } = req.params;
    const { status } = req.body; // 'Approved' 'Denied'

    if (!['Approved', 'Denied'].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    const sql = "UPDATE visa_applications SET visa_status = ? WHERE id = ?";
    db.query(sql, [status, visa_id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error updating visa status" });
        }
        res.json({ success: `Visa status updated ${status} successfully` });
    });
});

router.get('/total-paid-fees', (req, res) => {
    const sql = "SELECT SUM(visa_fee) AS total_paid_fees FROM visa_applications WHERE payment_status = 'Paid'";
    
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error fetching total visa fees" });
        }
        res.json({ total_paid_fees: result[0].total_paid_fees });
    });
});

// Update payment status
router.put('/permit-payment-update/:visa_id', authenticateAdmin, (req, res) => {
    const { visa_id } = req.params;
    const { status } = req.body; // 'Paid'

    if (!['Paid'].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    const sql = "UPDATE permit_applications SET payment_status = ? WHERE id = ?";
    db.query(sql, [status, visa_id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error updating agent status" });
        }
        res.json({ success: `Payment updated ${status} successfully` });
    });
});

router.put('/permit-update/:visa_id', authenticateAdmin, (req, res) => {
    const { visa_id } = req.params;
    const { status } = req.body; // 'Approved' 'Denied'

    if (!['Approved', 'Denied'].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    const sql = "UPDATE permit_applications SET visa_status = ? WHERE id = ?";
    db.query(sql, [status, visa_id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error updating visa status" });
        }
        res.json({ success: `Visa status updated ${status} successfully` });
    });
});

router.get('/total-not-paid-fees', (req, res) => {
    const sql = "SELECT SUM(visa_fee) AS total_not_paid_fees FROM visa_applications WHERE payment_status = 'Not Paid'";
    
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error fetching total visa fees" });
        }
        res.json({ total_not_paid_fees: result[0].total_not_paid_fees });
    });
});

router.get('/total-paid-permit', (req, res) => {
    const sql = "SELECT SUM(visa_fee) AS total_paid_fees FROM permit_applications WHERE payment_status = 'Paid'";
    
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error fetching total visa fees" });
        }
        res.json({ total_paid_fees: result[0].total_paid_fees });
    });
});


router.get('/total-not-paid-permit', (req, res) => {
    const sql = "SELECT SUM(visa_fee) AS total_not_paid_fees FROM permit_applications WHERE payment_status = 'Not Paid'";
    
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error fetching total visa fees" });
        }
        res.json({ total_not_paid_fees: result[0].total_not_paid_fees });
    });
});

router.get('/insur-app', authenticateAdmin, (req, res) => {
    const sql = "SELECT * FROM insurance_applications ORDER BY created_at DESC";
    
    db.query(sql, (err, result) => {
        if (err, result) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error fetching insurance application" });
        }
        res.json(result);
    });
})

//Get visa destinations
router.get('/destinations', authenticateAdmin, (req, res) => {

    db.query(
        "SELECT id, destination, visa_excerpt, visa_description, visa_price, visa_agent_price, process_time, process_type, available_country FROM visa_destinations",
        (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }

            if (results.length === 0) {
                return res.json({ message: "No visa destinations found", data: [] });
            }

            res.json({ message: "Visa destinations fetched successfully", data: results });
        }
    );
});

router.get('/destinations/:id', authenticateAdmin, (req, res) => {
    const id = req.params.id
    if(!id) {
        console.log("No ID received")
    }
    db.query(
        "SELECT * FROM visa_destinations WHERE id = ?", [id],
        (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "Destination not found" });
            }
    
            res.json(results[0]);
        });
})

// Delete an destination
router.delete('/delete-destinations/:visa_id', authenticateAdmin, (req, res) => {
    const { visa_id } = req.params;

    const sql = "DELETE FROM visa_destinations WHERE id = ?";
    db.query(sql, [visa_id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error deleting agent" });
        }
        res.json({ success: "Visa destination deleted successfully" });
    });
});


//Get permit destinations
router.get('/permit', authenticateAdmin, (req, res) => {

    db.query(
        "SELECT * FROM permit_destinations",
        (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }

            if (results.length === 0) {
                return res.json({ message: "No permit destinations found", data: [] });
            }

            res.json({ message: "Permit destinations fetched successfully", data: results });
        }
    );
});

router.get('/permit/:id', authenticateAdmin, (req, res) => {
    const id = req.params.id
    if(!id) {
        console.log("No ID received")
    }
    db.query(
        "SELECT * FROM permit_destinations WHERE id = ?", [id],
        (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "Destination not found" });
            }
    
            res.json(results[0]);
        });
})

// Delete an destination
router.delete('/delete-permit/:visa_id', authenticateAdmin, (req, res) => {
    const { visa_id } = req.params;

    const sql = "DELETE FROM permit_destinations WHERE id = ?";
    db.query(sql, [visa_id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error deleting permit" });
        }
        res.json({ success: "Permit destination deleted successfully" });
    });
});

module.exports = router;
