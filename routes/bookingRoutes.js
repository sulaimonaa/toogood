const express = require('express');
const multer = require('multer');
const db = require('../db');
const authenticateAdmin = require('../middlewares/adminAuth');
const nodemailer = require('nodemailer');
const router = express.Router();

const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

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

/**
 * @route POST /app
 * @desc Submit visa application and initialize payment
 */
router.post("/app", upload.fields([{ name: "upload_signature", maxCount: 1 }]), async (req, res) => {
    try {
        // Destructure required fields
        const {
            first_name, last_name, email, phone_number, amount_to_pay,
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
        if (!amount_to_pay || isNaN(amount_to_pay) || amount_to_pay <= 0) {
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
                hotel_details, visa_embassy, upload_signature, tx_ref, amount_to_pay
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            upload_signature, tx_ref, amount_to_pay
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

            const bookingId = result.insertId || result.id;

            try {
                // Send confirmation email using Resend
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
                        amount: parseFloat(amount_to_pay),
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
                        amount: parseFloat(amount_to_pay),
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
    const sql = "SELECT * FROM visa_bookings ORDER BY id DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to retrieve bookings",
                error: err.message
            });
        }
        res.json(results);
    });
});

// Helper function to send confirmation email using Resend
async function sendConfirmationEmail(data) {
    try {
        const { data: emailData, error } = await resend.emails.send({
            from: 'Too Good Travels <noreply@toogoodtravels.net>',
            to: data.email,
            cc: "toogoodtravelsnigeria@gmail.com",
            subject: "Visa Support Booking Application Submitted Successfully",
            html: `
                <div style="padding: 20px; font-family: Arial, sans-serif; background-color: #f8f8f8; border-radius: 5px;">
                    <h2 style="color: #333;">Dear ${data.first_name} ${data.last_name},</h2>
                    <p style="color: #555;">Thank you for submitting your visa support booking application.</p>
                    
                    <div style="background-color: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
                        <h3 style="color: #333; margin-top: 0;">Application Details:</h3>
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9f9f9; border-radius: 3px;">
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee; width: 30%;"><strong>Full Name:</strong></td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.first_name} ${data.last_name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Phone Number:</strong></td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.phone_number}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.email}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Destination:</strong></td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.destination}</td>
                            </tr>
                            ${data.trip_type ? `
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Travel Type:</strong></td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.trip_type}</td>
                            </tr>
                            ` : ''}
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Travel Period:</strong></td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.coverage_begin} to ${data.coverage_end}</td>
                            </tr>
                            ${data.flight_details ? `
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Flight Details:</strong></td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.flight_details}</td>
                            </tr>
                            ` : ''}
                            ${data.hotel_details ? `
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Hotel Details:</strong></td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.hotel_details}</td>
                            </tr>
                            ` : ''}
                            ${data.upload_signature ? `
                            <tr>
                                <td style="padding: 10px;"><strong>Passport Data Page:</strong></td>
                                <td style="padding: 10px;">
                                    <a href="${process.env.BASE_URL || 'https://toogood-1.onrender.com'}/uploads/${data.upload_signature}" style="color: #007bff; text-decoration: none;">
                                        Download/View
                                    </a>
                                </td>
                            </tr>
                            ` : ''}
                        </table>
                    </div>

                    <p style="color: #555; margin-top: 20px;">
                        We will review your application and get back to you soon.
                    </p>
                    <p style="color: #333; margin-bottom: 0;"><strong>Best regards,</strong></p>
                    <p style="color: #333;"><strong>Too Good Travels</strong></p>
                </div>
            `
        });

        if (error) {
            console.error("Resend email error:", error);
            throw error;
        }

        console.log("Resend email sent successfully:", emailData?.id);
        return emailData;

    } catch (error) {
        console.error("Email sending error:", error);
        throw error;
    }
}
module.exports = router;

