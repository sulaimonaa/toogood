const express = require('express');
const multer = require('multer');
const db = require('../db');
const authenticateAdmin = require('../middlewares/adminAuth');
const nodemailer = require("nodemailer");
const router = express.Router();





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

router.post("/application", upload.fields([
    { name: "upload_signature", maxCount: 1 }
]), async (req, res) => {
    try {
        const { first_name, middle_name, last_name, phone_number, contact_email, date_of_birth, passport_number, address, occupation, gender, marital_status, travel_type, purpose_travel, other_reason, next_of_kin, next_of_kin_address, relationship, coverage_begin, coverage_end, destination, more_ninety, medical_condition, more_medical_condition, heard_policy} = req.body;

        if (!first_name || !last_name || !phone_number || !contact_email || !passport_number) {
            return res.status(400).json({ message: "Missing required fields" });
        }


        // Store file paths
        const upload_signature = req.files["upload_signature"] ? req.files["upload_signature"][0].filename : null;

        const sql = `
            INSERT INTO insurance_applications (
                first_name, middle_name, last_name, phone_number, contact_email, date_of_birth, passport_number, address, occupation, gender, marital_status, travel_type, purpose_travel, other_reason, next_of_kin, next_of_kin_address, relationship, coverage_begin, coverage_end, destination, more_ninety, medical_condition, more_medical_condition, heard_policy, upload_signature
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            first_name, middle_name, last_name, phone_number, contact_email, date_of_birth, passport_number, address, occupation, gender, marital_status, travel_type, purpose_travel, other_reason, next_of_kin, next_of_kin_address, relationship, coverage_begin, coverage_end, destination, more_ninety, medical_condition, more_medical_condition, heard_policy, upload_signature
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
                cc:"insurance@toogoodtravels.net",
                subject: "Insurance Application Submitted Successfully",
                html: `
                    <div style="padding: 20px; font-family: Arial, sans-serif; background-color: #f8f8f8; border-radius: 5px;">
                        <h2 style="color: #333;">Dear ${first_name} ${last_name},</h2>
                        <p style="color: #555;">Thank you for submitting your insurance application.</p>

                        <div style="background-color: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
                            <h3 style="color: #333;">Application Details:</h3>
                            <ul style="padding-left: 20px;">
                                <li><strong>Full Name:</strong> ${first_name} ${middle_name} ${last_name}</li>
                                <li><strong>Phone Number:</strong> ${phone_number}</li>
                                <li><strong>Email:</strong> ${contact_email}</li>
                                <li><strong>Passport Number:</strong> ${passport_number}</li>
                                <li><strong>Destination:</strong> ${destination}</li>
                                <li><strong>Travel Type:</strong> ${travel_type}</li>
                                <li><strong>Coverage Period:</strong> ${coverage_begin} to ${coverage_end}</li>
                                <li><strong>Passport Data Page:</strong> <a href="https://toogood-1.onrender.com/uploads/${upload_signature}"">Download/View</a></li>
                            </ul>
                        </div>

                        <p style="color: #555; margin-top: 20px;">We will review your application and get back to you soon.</p>
                        <p style="color: #333;"><strong>Best regards,</strong></p>
                        <p style="color: #333;">Too Good Travels</p>
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

            res.json({ success: "Insurance application submitted successfully"});
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/all', authenticateAdmin, (req, res) => {
    const sql = "SELECT * FROM insurance_applications ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

router.get('/first-ten', authenticateAdmin, (req, res) => {
    const sql = "SELECT * FROM insurance_applications ORDER BY created_at DESC LIMIT 10";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

router.get('/status/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM insurance_applications WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error fetching visa details" });
        }
        res.json(result[0]);
    });
});

module.exports = router;