const express = require('express');
const multer = require('multer');
const db = require('../db');
const authenticateAdmin = require('../middlewares/adminAuth');
const nodemailer = require("nodemailer");
const router = express.Router();


// Add Visa Destination (Admin Only)
router.post('/add_visa', authenticateAdmin, (req, res) => {
    const { destination, visa_excerpt, visa_description, visa_price, visa_agent_price, process_time, process_type, available_country } = req.body;

    if (!destination || !visa_excerpt || !visa_description || !visa_price || !visa_agent_price || !process_time || !process_type || !available_country) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const sql = "INSERT INTO visa_destinations (destination, visa_excerpt, visa_description, visa_price, visa_agent_price, process_time, process_type, available_country) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [destination, visa_excerpt, visa_description, visa_price, visa_agent_price, process_time, process_type, available_country];

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

//new route for available destinations
router.get('/available-destinations', (req, res) => {
    const { search } = req.query;

    // Base query
    let query = `
        SELECT id, destination, visa_excerpt, visa_description, visa_price, 
               visa_agent_price, process_time, process_type, available_country 
        FROM visa_destinations 
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
                message: "No matching visa destinations found",
                data: []
            });
        }

        res.json({
            message: "Visa destinations fetched successfully",
            data: results
        });
    });
});

// Get visa destination by ID
router.get('/destinations/:id', (req, res) => {
    const id = req.params.id
    if (!id) {
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

router.put('/update', authenticateAdmin, async (req, res) => {
    const { destination, visa_excerpt, visa_description, visa_price, visa_agent_price, process_time, process_type, available_country } = req.body;
    const { visa_id } = req.body;

    if (!destination && !visa_excerpt && !visa_description && !visa_price && !visa_agent_price && !process_time && !process_type && !available_country) {
        return res.status(400).json({ message: "At least one field must be provided to update" });
    }

    try {
        // Step 1: Fetch current details
        db.query("SELECT * FROM visa_destinations WHERE id = ?", [visa_id], async (err, results) => {
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
            if (visa_excerpt && visa_excerpt !== visa.visa_excerpt) {
                updateFields.push("visa_excerpt = ?");
                values.push(visa_excerpt);
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
            if (process_time && process_time !== visa.process_time) {
                updateFields.push("process_time= ?");
                values.push(process_time);
            }
            if (process_type && process_type !== visa.process_type) {
                updateFields.push("process_type= ?");
                values.push(process_type);
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
            const sql = `UPDATE visa_destinations SET ${updateFields.join(", ")} WHERE id = ?`;

            db.query(sql, values, (updateErr, result) => {
                if (updateErr) {
                    console.error("Update error:", updateErr);
                    return res.status(500).json({ message: "Error updating visa details" });
                }
                res.json({ success: "Visa details updated successfully" });
            });
        });

    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// Configure file upload storage
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

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

        // Auto-generate tracking ID
        const tracking_id = `VISA${Math.floor(Math.random() * 1000000000)}`;

        // Store file paths
        const data_page = req.files["data_page"] ? req.files["data_page"][0].filename : null;
        const passport_photograph = req.files["passport_photograph"] ? req.files["passport_photograph"][0].filename : null;
        const utility_bill = req.files["utility_bill"] ? req.files["utility_bill"][0].filename : null;
        const supporting_document = req.files["supporting_document"] ? req.files["supporting_document"][0].filename : null;
        const other_document = req.files["other_document"] ? req.files["other_document"][0].filename : null;

        const sql = `
            INSERT INTO visa_applications (
                first_name, middle_name, last_name, phone_number, contact_email, date_of_birth, 
                passport_number, data_page, passport_photograph, utility_bill, supporting_document, 
                other_document, tracking_id, payment_status, visa_status, visa_destination, visa_fee, process_time, process_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Not Paid', 'Pending', ?, ?, ?, ?)`;

        const values = [
            first_name, middle_name, last_name, phone_number, contact_email, date_of_birth, passport_number,
            data_page, passport_photograph, utility_bill, supporting_document, other_document, tracking_id, visa_destination, visa_fee, process_time, process_type
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
                    subject: "Visa Application Submitted Successfully",
                    html: `
                        <div style="display:none;">
                            ${Math.random().toString(36).substring(2)} 
                        </div>
                        <div style="padding: 20px; font-family: Arial, sans-serif; background-color: #f8f8f8; border-radius: 5px;">
                            <h2 style="color: #333;">Dear ${first_name} ${last_name},</h2>
                            <p style="color: #555;">Thank you for submitting your visa application.</p>

                            <div style="background-color: #fff; padding: 15px;">
    <!-- Passport Photo - Top on mobile, left on desktop -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 15px;">
        <tr>
            <td align="center" style="padding-bottom: 15px;">
                <img src="https://toogood-1.onrender.com/uploads/${passport_photograph}" alt="Your passport photograph" style="width: 120px; height: 120px; border: 1px solid #ccc; display: block; margin: 0 auto;">
            </td>
        </tr>
    </table>

    <!-- Logo and Title -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 15px;">
        <tr>
            <td align="center" valign="middle">
                <img src="https://toogoodtravels.net/static/media/tgt.7dbe67b2cd1d73dd1a15.png" alt="logo" style="width: 84px; display: inline-block; vertical-align: middle;">
                <h3 style="color: green; font-weight: bolder; font-size: 1.2em; text-transform: uppercase; margin: 0; display: inline-block; vertical-align: middle; padding-left: 10px;">Application Confirmation</h3>
            </td>
        </tr>
    </table>

    <!-- Application Details Table -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; border: 1px solid #ddd;">
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Full Name:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${first_name} ${middle_name} ${last_name}</td>
        </tr>
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Phone Number:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${phone_number}</td>
        </tr>
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${contact_email}</td>
        </tr>
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Passport Number:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${passport_number}</td>
        </tr>
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Destination:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${visa_destination}</td>
        </tr>
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Tracking ID:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${tracking_id}</td>
        </tr>
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Processing Fee:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${visa_fee}</td>
        </tr>
        <tr>
            <td style="padding: 8px;"><strong>Passport Data Page:</strong></td>
            <td style="padding: 8px;"><a href="https://toogood-1.onrender.com/uploads/${data_page}">Download/View</a></td>
        </tr>
    </table>
</div>

                            <p style="color: #555; margin-top: 20px;">We will review your application and get back to you soon.</p>
                            <p style="color: #333; margin-bottom: 0"><strong>Best regards,</strong></p>
                            <p style="color: #333;"><strong>Too Good Travels</strong></p>
                        </div>
                    `,
                });

                if (error) {
                    console.error("Resend email error:", error);
                    // Still respond success but log the email error
                    console.log("Application saved but email failed to send");
                } else {
                    console.log("Resend email sent successfully:", data.id);
                }

                res.json({ success: "Visa application submitted successfully", tracking_id });

            } catch (emailError) {
                console.error("Email sending error:", emailError);
                // Still respond success since the application was saved to database
                res.json({
                    success: "Visa application submitted successfully",
                    tracking_id,
                    warning: "Confirmation email could not be sent"
                });
            }
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/appointment", async (req, res) => {
    try {
        const { first_name, last_name, phone_number, email_address, how_to_contact, appointment_date, appointment_time, reason, amount_to_pay } = req.body;

        if (!first_name || !last_name || !phone_number || !email_address) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const sql = `
            INSERT INTO schedule_appointment (
                first_name, last_name, phone_number, email_address, how_to_contact, appointment_date, appointment_time, reason, amount_to_pay, payment_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Not Paid')`;

        const values = [
            first_name, last_name, phone_number, email_address, how_to_contact, appointment_date, appointment_time, reason, amount_to_pay
        ];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error" });
            }

            // Email content
            const mailOptions = {
                from: '"Too Good Travels" <noreply@toogoodtravels.net>',
                to: email_address,
                cc: "toogoodtravelsnigeria@gmail.com",
                subject: "Appointment Schedule",
                html: `
                    <div style="padding: 20px; font-family: Arial, sans-serif; background-color: #f8f8f8; border-radius: 5px;">
                        <h2 style="color: #333;">Dear ${last_name},</h2>
                        <p style="color: #555;">Thank you for scheduling an appointment with us!</p>
                        <div style="background-color: #fff; padding: 15px;">
                            <div style="border-left: 5px solid #ff4000; display: flex; flex-direction: column; gap: 5px">
                                <div>Name: ${last_name} ${first_name}</div> 
                                <div>Email: ${email_address}</div>
                                <div>Phone: ${phone_number}</div>
                                <div>Where to host schedule: ${how_to_contact}</div>
                                <div>Reason for appointment: ${reason}</div>
                                <div>Appointment date: ${appointment_date}</div>
                                <div>Appointment time: ${appointment_time}</div>
                            </div>
                        </div>
                        <p style="color: #555; margin-top: 20px;">We will review your appointment and get back to you soon.</p>
                        <p style="color: #333; margin-bottom: 0"><strong>Best regards,</strong></p>
                        <p style="color: #333;"><strong>Too Good Travels</strong></p>
                    </div>
                `,
            };

            transporter.sendMail(mailOptions, (emailError, info) => {
                if (emailError) {
                    console.error("Email sending error:", emailError);
                } else {
                    console.log("Email sent successfully:", info.response);
                }
            });

            // ✅ use insertId as tracking_id
            res.json({ success: "Appointment submitted successfully" });
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

router.post('/app-payment-verification', async (req, res) => {
    try {
        const { transaction_id, tnx_id } = req.body;
        const verification = await flw.Transaction.verify({ id: transaction_id });

        if (verification.data.status === 'successful') {
            db.query(
                'UPDATE schedule_appointment SET payment_status = ? WHERE id = ?',
                ['Paid', tnx_id],
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
    const sql = "SELECT * FROM visa_applications WHERE visa_status = 'Pending'";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

router.get('/approved', authenticateAdmin, (req, res) => {
    const sql = "SELECT * FROM visa_applications WHERE visa_status = 'Approved'";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

router.get('/denied', authenticateAdmin, (req, res) => {
    const sql = "SELECT * FROM visa_applications WHERE visa_status = 'Denied'";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

router.get('/all', authenticateAdmin, (req, res) => {
    const sql = "SELECT * FROM visa_applications ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

router.get('/all-paid-visa', authenticateAdmin, (req, res) => {
    const sql = "SELECT * FROM visa_applications WHERE payment_status = 'Paid' ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

router.get('/all-not-paid-visa', authenticateAdmin, (req, res) => {
    const sql = "SELECT * FROM visa_applications WHERE payment_status = 'Not Paid' ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

router.get('/first-ten', authenticateAdmin, (req, res) => {
    const sql = "SELECT * FROM visa_applications ORDER BY created_at DESC LIMIT 10";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

router.get('/status/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM visa_applications WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error fetching visa details" });
        }
        res.json(result[0]);
    });
})

router.post('/track-visa', (req, res) => {
    const { tracking_id } = req.body;

    if (!tracking_id) {
        console.log('No tracking ID provided');
        return res.status(400).json({ message: "Tracking ID is required" });
    }

    const sql = "SELECT * FROM visa_applications WHERE tracking_id = ?";
    db.query(sql, [tracking_id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error fetching visa details" });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Tracking ID not found" });
        }

        res.json(result[0]);
    });
});

router.put('/upload/:id', upload.fields([{ name: "visa_file", maxCount: 1 }]), authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const permitFile = req.files?.visa_file?.[0];

    if (!permitFile) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    // Store the public URL instead of the filesystem path
    const fileUrl = `/uploads/${permitFile.filename}`;

    const sql = `UPDATE visa_applications SET visa_file = ? WHERE id = ?`;
    const values = [fileUrl, id];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error updating visa application" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Visa application not found" });
        }

        res.json({
            message: "Visa file uploaded successfully",
            fileUrl: fileUrl,  // Send back the accessible URL
            data: result
        });
    });
});

module.exports = router;