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


const app = express()

app.use(express.static(path.join(__dirname, "public")))
app.use(cors())
app.use(express.json())

const port = process.env.PORT

app.use("/uploads", express.static("uploads"))
app.use('/agents', agentRoutes)
app.use('/admin', adminRoutes)
app.use('/visa', visaRoutes)
app.use('/permit', permitRoutes)
app.use('/insurance', insuranceRoutes)
app.use('/bookings', bookingRoutes)

app.listen(port, () => {
    console.log("Server listening on port", port);
});


