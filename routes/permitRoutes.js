const express = require('express');
const multer = require('multer');
const db = require('../db');
const authenticateAdmin = require('../middlewares/adminAuth');
const nodemailer = require("nodemailer");
const router = express.Router();

// Add Visa Destination (Admin Only)
router.post('/add_permit', authenticateAdmin, (req, res) => {
    const { destination, visa_description, visa_price, visa_agent_price, available_country } = req.body;

    if (!destination || !visa_description || !visa_price || !visa_agent_price || !available_country) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const sql = "INSERT INTO permit_destinations (destination, visa_description, visa_price, visa_agent_price, available_country) VALUES (?, ?, ?, ?, ?)";
    const values = [destination, visa_description, visa_price, visa_agent_price, available_country];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Something went wrong!" });
        }
        res.json({ success: "Permit destination added successfully!" });
    });
});

//new route for available destinations
router.get('/available-destinations', (req, res) => {
    const { search } = req.query;

    // Base query
    let query = `
        SELECT id, destination, visa_description, visa_price, 
               visa_agent_price, available_country 
        FROM permit_destinations
        WHERE 1=1
    `;

    const params = [];

    // Add search term filter if provided
    if (search) {
        query += ` AND (destination LIKE ? OR visa_description LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
    }

    // Add sorting by relevance if searching
    if (search) {
        query += `
            ORDER BY 
                CASE 
                    WHEN destination = ? THEN 1 
                    WHEN destination LIKE ? THEN 2 
                    ELSE 3 
                END
        `;
        params.push(search, `${search}%`);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                message: "Database error",
                error: err
            });
        }

        if (results.length === 0) {
            return res.json({
                message: "No matching permit destinations found",
                data: []
            });
        }

        res.json({
            message: "Permit destinations fetched successfully",
            data: results
        });
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
    if (!id) {
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

router.put('/update', authenticateAdmin, async (req, res) => {
    const { destination, visa_description, visa_price, visa_agent_price, available_country } = req.body;
    const { visa_id } = req.body;

    if (!destination && !visa_description && !visa_price && !visa_agent_price && !available_country) {
        return res.status(400).json({ message: "At least one field must be provided to update" });
    }

    try {
        // Step 1: Fetch current details
        db.query("SELECT * FROM permit_destinations WHERE id = ?", [visa_id], async (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "Destination not found" });
            }

            const visa = results[0];
            let updateFields = [];
            let values = [];

            // Step 2: Only update if new value is provided and different from current one
            if (destination && destination !== visa.destination) {
                updateFields.push("destination = ?");
                values.push(destination);
            }
            if (visa_description && visa_description !== visa.visa_description) {
                updateFields.push("visa_description = ?");
                values.push(visa_description);
            }
            if (visa_price && visa_price !== visa.visa_price) {
                updateFields.push("visa_price = ?");
                values.push(visa_price);
            }
            if (visa_agent_price && visa_agent_price !== visa.visa_agent_price) {
                updateFields.push("visa_agent_price = ?");
                values.push(visa_agent_price);
            }
            if (available_country && available_country !== visa.available_country) {
                updateFields.push("available_country= ?");
                values.push(available_country);
            }
            if (updateFields.length === 0) {
                return res.json({ message: "No changes detected" });
            }

            // Step 3: Execute update query
            values.push(visa_id);
            const sql = `UPDATE permit_destinations SET ${updateFields.join(", ")} WHERE id = ?`;

            db.query(sql, values, (updateErr, result) => {
                if (updateErr) {
                    console.error("Update error:", updateErr);
                    return res.status(500).json({ message: "Error updating permit details" });
                }
                res.json({ success: "Permit details updated successfully" });
            });
        });

    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// Configure file upload storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname
            .toLowerCase()
            .replace(/\s+/g, '-')         // spaces -> dashes
            .replace(/[^a-z0-9.-]/g, ''); // remove special chars
        const uniqueName = Date.now() + '-' + safeName;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

// Create Permit Application Route
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
                    subject: "Permit Application Submitted Successfully",
                    html: `
                        <!DOCTYPE html>
<html lang="en" style="margin:0; padding:0;">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
        @media screen and (max-width: 640px) {
            .mTable {
                max-width: 100% !important;
                width: 100% !important;
                margin: 0 auto !important;
            }

            .step-table {
                width: 100% !important;
                display: block !important;
                margin-bottom: 20px !important;
                padding: 0 !important;
            }
        }

        @media screen and (max-width: 425px) {
            .sm {
                padding: 10px !important;
            }

        }
    </style>
</head>

<body style="margin:0; padding:0; background:#f5f6fa; font-family:Arial, sans-serif; color:#333;">
    <table width="100%" cellpadding="0" cellspacing="0" class="sm" style="background-color:#f5f6fa; padding:10px;">
        <tr>
            <td align="center">
                <!-- Main container -->
                <table class="mTable" width="680" cellpadding="0" cellspacing="0"
                    style="background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">

                    <!-- Content -->
                    <tr>
                        <td align="center" class="sm" style="padding: 20px;">
                            <div style="background-color: #fff; padding: 15px;">
                                <!-- Passport Photo - Top on mobile, left on desktop -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                    style="margin-bottom: 15px;">
                                    <tr>
                                        <td align="center" valign="middle">
                                            <img src="https://toogoodtravels.net/static/media/tgt.7dbe67b2cd1d73dd1a15.png"
                                                alt="logo"
                                                style="width: 84px; display: inline-block; vertical-align: middle;">
                                        </td>
                                    </tr>
                                </table>

                                <!-- Logo and Title -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                    style="margin-bottom: 15px;" colspan="2">
                                    <tr>
                                        <td align="center" style="padding-bottom: 15px;">
                                            <p style="color: #555; margin-bottom: 15px;">Thank you ${first_name}
                                                ${last_name}, for submitting your visa application.</p>
                                            <img src="https://toogood-1.onrender.com/uploads/${passport_photograph}"
                                                alt="Your passport photograph"
                                                style="width: 120px; height: 120px; border: 1px solid #ccc; display: block; margin: 0 auto;">

                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" valign="middle" style="padding-top: 10px;">
                                            <h3
                                                style="color: green; font-weight: bolder; font-size: 1.2em; text-transform: uppercase; margin: 0; display: inline-block; vertical-align: middle; padding-left: 10px;">
                                                Application Confirmation</h3>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Application Details Table -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                    style="background-color: #f5f5f5; border: 1px solid #ddd;">
                                    <tr>
                                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Full
                                                Name:</strong>
                                        </td>
                                        <td style="padding: 8px; border-bottom: 1px solid #ddd; background: #9ffab935;">
                                            ${first_name}
                                            ${middle_name} ${last_name}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Phone
                                                Number:</strong></td>
                                        <td style="padding: 8px; border-bottom: 1px solid #ddd; background: #9ffab935;">
                                            ${phone_number}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Email:</strong>
                                        </td>
                                        <td style="padding: 8px; border-bottom: 1px solid #ddd; background: #9ffab935;">
                                            ${contact_email}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Passport
                                                Number:</strong></td>
                                        <td style="padding: 8px; border-bottom: 1px solid #ddd; background: #9ffab935;">
                                            ${passport_number}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">
                                            <strong>Destination:</strong>
                                        </td>
                                        <td style="padding: 8px; border-bottom: 1px solid #ddd; background: #9ffab935;">
                                            ${visa_destination}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Processing
                                                Fee:</strong></td>
                                        <td style="padding: 8px; border-bottom: 1px solid #ddd; background: #9ffab935;">
                                            ${visa_fee}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px;"><strong>Passport Data Page:</strong></td>
                                        <td style="padding: 8px; background: #9ffab935;"><a
                                                href="https://toogood-1.onrender.com/uploads/${data_page}">Download/View</a>
                                        </td>
                                    </tr>
                                </table>
                                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                    style="margin-top: 15px;">
                                    <tr>
                                        <td align="center">
                                            <p style="color: #555; margin-top: 20px;">We will review your application
                                                and get back to you soon.</p>
                                            <p style="color: #333; margin-bottom: 0"><strong>Best regards,</strong></p>
                                            <p style="color: #333; margin: 0;"><strong>Too Good Travels</strong></p>
                                        </td>
                                    </tr>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    </td>
    </tr>
    </table>
</body>

</html>
                    `,
                });

                if (error) {
                    console.error("Resend email error:", error);
                    // Still respond success but log the email error
                    console.log("Permit application saved but confirmation email failed to send");
                } else {
                    console.log("Resend email sent successfully:", data.id);
                }

                res.json({ success: "Permit application submitted successfully" });

            } catch (emailError) {
                console.error("Email sending error:", emailError);
                // Still respond success since the application was saved to database
                res.json({
                    success: "Permit application submitted successfully",
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
                'UPDATE permit_applications SET payment_status = ? WHERE id = ?',
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
        if (err) return res.status(500).json({ message: "Database error" });
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

router.put('/upload/:id', upload.fields([{ name: "permit_file", maxCount: 1 }]), authenticateAdmin, (req, res) => {
    const { id } = req.params;

    // Get the uploaded file - Multer puts files in req.files, not req.body
    const permitFile = req.files?.permit_file?.[0];

    if (!permitFile) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `/uploads/${permitFile.filename}`;

    const sql = `UPDATE permit_applications SET permit_file = ? WHERE id = ?`;
    const values = [fileUrl, id];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error updating permit application" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Permit application not found" });
        }

        res.json({ message: "Permit file uploaded successfully", data: result });
    });
});

module.exports = router;