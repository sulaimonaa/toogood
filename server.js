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

const app = express()

app.use(cors())
app.use(express.json())

app.use("/uploads", express.static("uploads"))

app.use('/agents', agentRoutes)
app.use('/admin', adminRoutes)
app.use('/visa', visaRoutes)
app.use('/permit', permitRoutes)
app.use('/insurance', insuranceRoutes)

app.use(express.static(path.join(__dirname)));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log("Server listening on port", port);
});
