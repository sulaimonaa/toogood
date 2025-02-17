const express = require('express');
const multer = require('multer');
const db = require('../db');
const authenticateAdmin = require('../middlewares/adminAuth');
const nodemailer = require("nodemailer"); 
const router = express.Router();

// Add Visa Destination (Admin Only)
router.post('/add_permit', authenticateAdmin, (req, res) => {
    const { destination, visa_price, available_country } = req.body;

    if (!destination || !visa_price || !available_country) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const sql = "INSERT INTO permit_destinations (destination, visa_price, available_country) VALUES (?, ?, ?)";
    const values = [destination, visa_price, available_country];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Something went wrong!" });
        }
        res.json({ success: "Visa destination added successfully!" });
    });
});

//Get visa destinations
router.get('/destinations', (req, res) => {

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

            res.json({ message: "permit destinations fetched successfully", data: results });
        }
    );
});

// Get visa destination by ID
router.get('/destinations/:id', (req, res) => {
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


// Configure file upload storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
    host: "mail.toogoodtravels.net",
    port: 465, 
    secure: true,
    auth: {
        user: "noreply@toogoodtravels.net", 
        pass: process.env.EMAIL_PASSKEY,
    },
});

// Create Visa Application Route
router.post("/application", upload.fields([
    { name: "data_page", maxCount: 1 },
    { name: "passport_photograph", maxCount: 1 },
    { name: "utility_bill", maxCount: 1 },
    { name: "supporting_document", maxCount: 1 },
    { name: "other_document", maxCount: 1 }
]), async (req, res) => {
    try {
        const { first_name, middle_name, last_name, phone_number, contact_email, date_of_birth, passport_number, visa_destination, visa_fee, process_time, process_type } = req.body;

        if (!first_name || !last_name || !phone_number || !contact_email || !passport_number) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Store file paths
        const data_page = req.files["data_page"] ? req.files["data_page"][0].filename : null;
        const passport_photograph = req.files["passport_photograph"] ? req.files["passport_photograph"][0].filename : null;
        const utility_bill = req.files["utility_bill"] ? req.files["utility_bill"][0].filename : null;
        const supporting_document = req.files["supporting_document"] ? req.files["supporting_document"][0].filename : null;
        const other_document = req.files["other_document"] ? req.files["other_document"][0].filename : null;

        const sql = `
            INSERT INTO permit_applications (
                first_name, middle_name, last_name, phone_number, contact_email, date_of_birth, 
                passport_number, data_page, passport_photograph, utility_bill, supporting_document, 
                other_document, payment_status, visa_status, visa_destination, visa_fee
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Not Paid', 'Pending', ?, ?)`;

        const values = [
            first_name, middle_name, last_name, phone_number, contact_email, date_of_birth, passport_number,
            data_page, passport_photograph, utility_bill, supporting_document, other_document, visa_destination, visa_fee
        ];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error" });
            }

            // Email content
            const mailOptions = {
                from: '"Too Good Travels" <noreply@toogoodtravels.net>',
                to: contact_email, 
                cc:"toogoodtravelsnigeria@gmail.com",
                subject: "Permit Application Submitted Successfully",
                html: `
                    <div style="padding: 20px; font-family: Arial, sans-serif; background-color: #f8f8f8; border-radius: 5px;">
                        <h2 style="color: #333;">Dear ${first_name} ${last_name},</h2>
                        <p style="color: #555;">Thank you for submitting your permit application.</p>

                        <div style="background-color: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
                            <h3 style="color: #333;">Application Details:</h3>
                            <ul style="padding-left: 20px;">
                                <li><strong>Full Name:</strong> ${first_name} ${middle_name} ${last_name}</li>
                                <li><strong>Phone Number:</strong> ${phone_number}</li>
                                <li><strong>Email:</strong> ${contact_email}</li>
                                <li><strong>Passport Number:</strong> ${passport_number}</li>
                                <li><strong>Destination:</strong> ${visa_destination}</li>
                                <li><strong>Processing Fee:</strong> ${visa_fee}</li>
                                <li><strong>Passport Data Page:</strong> <a href="https://toogood-1.onrender.com/uploads/${data_page}"">Download/View</a></li>
                            </ul>
                        </div>

                        <p style="color: #555; margin-top: 20px;">We will review your application and get back to you soon.</p>
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

            res.json({ success: "Permit application submitted successfully" });
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/pending', authenticateAdmin, (req, res) => {
    const sql = "SELECT * FROM permit_applications WHERE visa_status = 'Pending'";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

router.get('/approved', authenticateAdmin, (req, res) => {
    const sql = "SELECT * FROM permit_applications WHERE visa_status = 'Approved'";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

router.get('/denied', authenticateAdmin, (req, res) => {
    const sql = "SELECT * FROM permit_applications WHERE visa_status = 'Denied'";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

router.get('/all', authenticateAdmin, (req, res) => {
    const sql = "SELECT * FROM permit_applications ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

router.get('/all-paid-visa', authenticateAdmin, (req, res) => {
    const sql = "SELECT * FROM permit_applications WHERE payment_status = 'Paid' ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

router.get('/all-not-paid-visa', authenticateAdmin, (req, res) => {
    const sql = "SELECT * FROM permit_applications WHERE payment_status = 'Not Paid' ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

router.get('/first-ten', authenticateAdmin, (req, res) => {
    const sql = "SELECT * FROM permit_applications ORDER BY created_at DESC LIMIT 10";
    db.query(sql, (err, results) => {
        if(err) return res.status(500).json({message: "Database error"});
        res.json(results);
    });
});

router.get('/status/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM permit_applications WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error fetching visa details" });
        }
        res.json(result[0]);
    });
});

module.exports = router;