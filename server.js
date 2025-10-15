const express = require('express')
require("dotenv").config();
const db = require('./db')
const cors = require('cors')
const path = require('path')
const agentRoutes = require('./routes/agentRoutes')
const adminRoutes = require('./routes/adminRoutes');
const visaRoutes = require('./routes/visaRoutes');
const permitRoutes = require('./routes/permitRoutes');
const insuranceRoutes = require('./routes/insuranceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');


const app = express()

app.use(express.static(path.join(__dirname, "public")))
app.use(cors())
app.use(express.json())

const port = process.env.PORT

const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const formData = new FormData();
        formData.append('image', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        const response = await axios.post(
            'https://toogoodtravels.net/api/upload',
            formData,
            {
                headers: {
                    ...formData.getHeaders()
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Upload failed' });
    }
});

app.use("/uploads", express.static("uploads"))
app.use('/agents', agentRoutes)
app.use('/admin', adminRoutes)
app.use('/visa', visaRoutes)
app.use('/permit', permitRoutes)
app.use('/insurance', insuranceRoutes)
app.use('/bookings', bookingRoutes)
app.use('/payment', paymentRoutes)

app.listen(port, () => {
    console.log("Server listening on port", port);
});


