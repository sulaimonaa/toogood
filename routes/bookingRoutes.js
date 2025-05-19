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

router.post("/app", upload.fields([
    { name: "upload_signature", maxCount: 1 }
  ]), async (req, res) => {
    try {
      // Destructure all fields from req.body
      const { 
        first_name,
        middle_name,
        last_name,
        email,
        phone_number,
        date_of_birth,
        coverage_begin,
        coverage_end,
        destination,
        title,
        traveler_first_name,
        traveler_last_name,
        trip_type,
        flight_details,
        hotel_title,
        hotel_first_name,
        hotel_last_name,
        visa_interview_date,
        check_in_date,
        check_out_date,
        hotel_details, 
        visa_embassy
      } = req.body;
  
      // Validate required fields
      if (!first_name || !last_name || !phone_number || !email) {
        return res.status(400).json({ 
          success: false,
          message: "Missing required fields: first_name, last_name, phone_number, and email are required"
        });
      }
  
      // Handle file upload
      let upload_signature = null;
      if (req.files && req.files["upload_signature"]) {
        upload_signature = req.files["upload_signature"][0].filename;
      }
  
      // SQL query (fixed the extra comma)
      const sql = `
        INSERT INTO visa_bookings (
          first_name,
          middle_name,
          last_name,
          email,
          phone_number,
          date_of_birth,
          coverage_begin,
          coverage_end,
          destination,
          title,
          traveler_first_name,
          traveler_last_name,
          trip_type,
          flight_details,
          hotel_title,
          hotel_first_name,
          hotel_last_name,
          visa_interview_date,
          check_in_date,
          check_out_date,
          hotel_details,
          visa_embassy,
          upload_signature
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
      const values = [
        first_name,
        middle_name,
        last_name,
        email,
        phone_number,
        date_of_birth,
        coverage_begin,
        coverage_end,
        destination,
        title,
        traveler_first_name,
        traveler_last_name,
        trip_type,
        flight_details,
        hotel_title,
        hotel_first_name,
        hotel_last_name,
        visa_interview_date,
        check_in_date,
        check_out_date,
        hotel_details,
        visa_embassy,
        upload_signature
      ];
  
      // Execute database query
      db.query(sql, values, (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ 
            success: false,
            message: "Database operation failed"
          });
        }
  
        // Email content - using the provided email as contact_email
        const mailOptions = {
          from: '"Too Good Travels" <noreply@toogoodtravels.net>',
          to: email, // Using the submitted email
          cc: "toogoodtravelsnigeria@gmail.com",
          subject: "Visa Support Booking Application Submitted Successfully",
          html: `
            <div style="padding: 20px; font-family: Arial, sans-serif; background-color: #f8f8f8; border-radius: 5px;">
              <h2 style="color: #333;">Dear ${first_name} ${last_name},</h2>
              <p style="color: #555;">Thank you for submitting your visa support booking application.</p>
  
              <div style="background-color: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
                <h3 style="color: #333;">Application Details:</h3>
                <ul style="padding-left: 20px;">
                  <li><strong>Full Name:</strong> ${first_name} ${last_name}</li>
                  <li><strong>Phone Number:</strong> ${phone_number}</li>
                  <li><strong>Email:</strong> ${email}</li>
                  <li><strong>Destination:</strong> ${destination}</li>
                  ${trip_type ? `<li><strong>Travel Type:</strong> ${trip_type}</li>` : ''}
                  <li><strong>Travel Period:</strong> ${coverage_begin} to ${coverage_end}</li>
                  ${flight_details ? `<li><strong>Flight Details:</strong> ${flight_details}</li>` : ''}
                  ${hotel_details ? `<li><strong>Hotel Details:</strong> ${hotel_details}</li>` : ''}
                  ${upload_signature ? `<li><strong>Passport Data Page:</strong> <a href="https://toogood-1.onrender.com/uploads/${upload_signature}">Download/View</a></li>` : ''}
                </ul>
              </div>
  
              <p style="color: #555; margin-top: 20px;">We will review your application and get back to you soon.</p>
              <p style="color: #333; margin-bottom: 0"><strong>Best regards,</strong></p>
              <p style="color: #333;"><strong>Too Good Travels</strong></p>
            </div>
          `,
        };
  
        // Send email
        transporter.sendMail(mailOptions, (emailError, info) => {
          if (emailError) {
            console.error("Email sending error:", emailError);
            // Don't fail the request just because email failed
            return res.json({ 
              success: true,
              message: "Application submitted but email notification failed"
            });
          }
          
          console.log("Email sent successfully:", info.response);
          res.json({ 
            success: true,
            message: "Visa support booking submitted successfully"
          });
        });
      });
  
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ 
        success: false,
        message: "Internal server error"
      });
    }
  });

router.get('/all', authenticateAdmin, (req, res) => {
    const sql = "SELECT * FROM visa_bookings ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

module.exports = router;