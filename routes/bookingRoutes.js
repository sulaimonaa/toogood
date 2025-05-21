const express = require('express');
const multer = require('multer');
const db = require('../db');
const authenticateAdmin = require('../middlewares/adminAuth');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configure file upload storage
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

// Email transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "mail.toogoodtravels.net",
    port: parseInt(process.env.EMAIL_PORT) || 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER || "noreply@toogoodtravels.net",
        pass: process.env.EMAIL_PASSKEY
    }
});

/**
 * @route POST /app
 * @desc Submit visa application and initialize payment
 */
router.post("/app", upload.fields([{ name: "upload_signature", maxCount: 1 }]), async (req, res) => {
    try {
        // Destructure required fields
        const { 
            first_name, last_name, email, phone_number,
            amountToPay, 
            ...otherFields 
        } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !phone_number || !email) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: first_name, last_name, phone_number, and email are required"
            });
        }

        // Validate payment amount
        if (!amountToPay || isNaN(amountToPay) || amountToPay <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment amount"
            });
        }

        // Handle file upload
        const upload_signature = req.files?.["upload_signature"]?.[0]?.filename || null;

        // Generate unique transaction reference
        const tx_ref = `vs-${Math.floor(Math.random() * 1000000000)}`;

        // Insert into database
        const sql = `
            INSERT INTO visa_bookings (
                first_name, middle_name, last_name, email, phone_number,
                date_of_birth, coverage_begin, coverage_end, destination,
                title, traveler_first_name, traveler_last_name, trip_type,
                flight_details, hotel_title, hotel_first_name, hotel_last_name,
                visa_interview_date, check_in_date, check_out_date,
                hotel_details, visa_embassy, upload_signature, tx_ref, amountToPay
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            first_name, otherFields.middle_name || null, last_name,
            email, phone_number, otherFields.date_of_birth,
            otherFields.coverage_begin, otherFields.coverage_end,
            otherFields.destination, otherFields.title || null,
            otherFields.traveler_first_name || null, otherFields.traveler_last_name || null,
            otherFields.trip_type || null, otherFields.flight_details || null,
            otherFields.hotel_title || null, otherFields.hotel_first_name || null,
            otherFields.hotel_last_name || null, otherFields.visa_interview_date || null,
            otherFields.check_in_date || null, otherFields.check_out_date || null,
            otherFields.hotel_details || null, otherFields.visa_embassy || null,
            upload_signature, tx_ref, amountToPay
        ];

        // Execute database query
        db.query(sql, values, async (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Database operation failed",
                    error: err.message
                });
            }

            const bookingId = result.insertId;

            try {
                // Send confirmation email
                await sendConfirmationEmail({
                    first_name,
                    last_name,
                    email,
                    phone_number,
                    destination: otherFields.destination,
                    coverage_begin: otherFields.coverage_begin,
                    coverage_end: otherFields.coverage_end,
                    trip_type: otherFields.trip_type,
                    flight_details: otherFields.flight_details,
                    hotel_details: otherFields.hotel_details,
                    upload_signature
                });

                // Return success response with payment info
                res.json({
                    success: true,
                    message: "Application submitted successfully",
                    booking_id: bookingId,
                    payment_info: {
                        tx_ref: tx_ref,
                        amount: parseFloat(amountToPay),
                        currency: 'NGN',
                        customer_email: email,
                        customer_name: `${first_name} ${last_name}`,
                        customer_phone: phone_number,
                        meta: {
                            booking_id: bookingId
                        }
                    }
                });

            } catch (emailError) {
                console.error("Email error:", emailError);
                res.json({
                    success: true,
                    message: "Application submitted but email notification failed",
                    booking_id: bookingId,
                    payment_info: {
                        tx_ref: tx_ref,
                        amount: parseFloat(amountToPay),
                        currency: 'NGN',
                        customer_email: email,
                        customer_name: `${first_name} ${last_name}`,
                        meta: {
                            booking_id: bookingId
                        }
                    }
                });
            }
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

/**
 * @route GET /all
 * @desc Get all visa bookings (admin only)
 */
router.get('/all', authenticateAdmin, (req, res) => {
    const sql = "SELECT * FROM visa_bookings ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to retrieve bookings",
                error: err.message
            });
        }
        res.json({
            success: true,
            data: results
        });
    });
});

// Helper function to send confirmation email
async function sendConfirmationEmail(data) {
    const mailOptions = {
        from: `"Too Good Travels" <${process.env.EMAIL_USER || "noreply@toogoodtravels.net"}>`,
        to: data.email,
        cc: "toogoodtravelsnigeria@gmail.com",
        subject: "Visa Support Booking Application Submitted Successfully",
        html: `
            <div style="padding: 20px; font-family: Arial, sans-serif; background-color: #f8f8f8; border-radius: 5px;">
                <h2 style="color: #333;">Dear ${data.first_name} ${data.last_name},</h2>
                <p style="color: #555;">Thank you for submitting your visa support booking application.</p>
                
                <div style="background-color: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
                    <h3 style="color: #333;">Application Details:</h3>
                    <ul style="padding-left: 20px;">
                        <li><strong>Full Name:</strong> ${data.first_name} ${data.last_name}</li>
                        <li><strong>Phone Number:</strong> ${data.phone_number}</li>
                        <li><strong>Email:</strong> ${data.email}</li>
                        <li><strong>Destination:</strong> ${data.destination}</li>
                        ${data.trip_type ? `<li><strong>Travel Type:</strong> ${data.trip_type}</li>` : ''}
                        <li><strong>Travel Period:</strong> ${data.coverage_begin} to ${data.coverage_end}</li>
                        ${data.flight_details ? `<li><strong>Flight Details:</strong> ${data.flight_details}</li>` : ''}
                        ${data.hotel_details ? `<li><strong>Hotel Details:</strong> ${data.hotel_details}</li>` : ''}
                        ${data.upload_signature ? 
                            `<li><strong>Passport Data Page:</strong> 
                            <a href="${process.env.BASE_URL || 'https://toogood-1.onrender.com'}/uploads/${data.upload_signature}">
                                Download/View
                            </a></li>` : ''}
                    </ul>
                </div>

                <p style="color: #555; margin-top: 20px;">
                    We will review your application and get back to you soon.
                </p>
                <p style="color: #333; margin-bottom: 0"><strong>Best regards,</strong></p>
                <p style="color: #333;"><strong>Too Good Travels</strong></p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
}

module.exports = router;

