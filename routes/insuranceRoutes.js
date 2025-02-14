const express = require('express');
const multer = require('multer');
const db = require('../db');
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

            res.json({ success: "Insurance application submitted successfully"});
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;