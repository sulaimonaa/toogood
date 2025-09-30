const express = require('express');
const multer = require('multer');
const db = require('../db');
const authenticateAdmin = require('../middlewares/adminAuth');
const nodemailer = require("nodemailer");
const router = express.Router();





// Configure file upload storage
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post("/application", upload.fields([
    { name: "upload_signature", maxCount: 1 }
]), async (req, res) => {
    try {
        const { first_name, middle_name, last_name, phone_number, contact_email, date_of_birth, passport_number, address, occupation, gender, marital_status, travel_type, purpose_travel, other_reason, next_of_kin, next_of_kin_address, relationship, coverage_begin, coverage_end, destination, more_ninety, medical_condition, more_medical_condition, heard_policy, amount_to_pay } = req.body;

        if (!first_name || !last_name || !phone_number || !contact_email) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Store file paths
        const upload_signature = req.files["upload_signature"] ? req.files["upload_signature"][0].filename : null;

        const sql = `
            INSERT INTO insurance_applications (
                first_name, middle_name, last_name, phone_number, contact_email, date_of_birth, passport_number, address, occupation, gender, marital_status, travel_type, purpose_travel, other_reason, next_of_kin, next_of_kin_address, relationship, coverage_begin, coverage_end, destination, more_ninety, medical_condition, more_medical_condition, heard_policy, amount_to_pay, upload_signature
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            first_name, middle_name, last_name, phone_number, contact_email, date_of_birth, passport_number, address, occupation, gender, marital_status, travel_type, purpose_travel, other_reason, next_of_kin, next_of_kin_address, relationship, coverage_begin, coverage_end, destination, more_ninety, medical_condition, more_medical_condition, heard_policy, amount_to_pay, upload_signature
        ];

        db.query(sql, values, async (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error" });
            }

            try {
                // Send email using Resend
                const { data, error } = await resend.emails.send({
                    from: 'Too Good Travels <noreply@toogoodtravels.net>',
                    to: contact_email,
                    cc: "toogoodtravelsnigeria@gmail.com",
                    subject: "Insurance Application Submitted Successfully",
                    html: `
                        <div style="padding: 20px; font-family: Arial, sans-serif; background-color: #f8f8f8; border-radius: 5px;">
                            <h2 style="color: #333;">Dear ${first_name} ${last_name},</h2>
                            <p style="color: #555;">Thank you for submitting your insurance application.</p>

                            <div style="background-color: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
                                <h3 style="color: #333; margin-top: 0;">Application Details:</h3>
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9f9f9; border-radius: 3px;">
                                    <tr>
                                        <td style="padding: 10px; border-bottom: 1px solid #eee; width: 30%;"><strong>Full Name:</strong></td>
                                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${first_name} ${middle_name} ${last_name}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Phone Number:</strong></td>
                                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${phone_number}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
                                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${contact_email}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Destination:</strong></td>
                                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${destination}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Coverage Period:</strong></td>
                                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${coverage_begin} to ${coverage_end}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px;"><strong>Passport Data Page:</strong></td>
                                        <td style="padding: 10px;"><a href="https://toogood-1.onrender.com/uploads/${upload_signature}" style="color: #007bff; text-decoration: none;">Download/View</a></td>
                                    </tr>
                                </table>
                            </div>

                            <p style="color: #555; margin-top: 20px;">We will review your application and get back to you soon.</p>
                            <p style="color: #333; margin-bottom: 0;"><strong>Best regards,</strong></p>
                            <p style="color: #333;"><strong>Too Good Travels</strong></p>
                        </div>
                    `,
                });

                if (error) {
                    console.error("Resend email error:", error);
                    // Still respond success but log the email error
                    console.log("Insurance application saved but confirmation email failed to send");
                } else {
                    console.log("Resend email sent successfully:", data.id);
                }

                res.json({ success: "Insurance application submitted successfully" });

            } catch (emailError) {
                console.error("Email sending error:", emailError);
                // Still respond success since the application was saved to database
                res.json({
                    success: "Insurance application submitted successfully",
                    warning: "Confirmation email could not be sent"
                });
            }
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/payment-verification', async (req, res) => {
    try {
        const { transaction_id, booking_id } = req.body;
        const verification = await flw.Transaction.verify({ id: transaction_id });

        if (verification.data.status === 'successful') {
            db.query(
                'UPDATE insurance_applications SET payment_status = ? WHERE id = ?',
                ['Paid', booking_id],
            );
            return res.json({ status: 'success' });
        }

        res.status(400).json({ status: 'failed' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
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