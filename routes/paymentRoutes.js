const express = require('express');
const router = express.Router();
const Flutterwave = require('flutterwave-node-v3');
const db = require('../db');

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);


// routes/payments.js
// In your payment verification endpoint
router.post('/verify', async (req, res) => {
  try {
    const { transaction_id } = req.body;
    const verification = await flw.Transaction.verify({ id: transaction_id });
    
    if (verification.data.status === 'successful') {
      db.query(
        'UPDATE visa_bookings SET payment_status = ? WHERE tx_ref = ?',
        ['Paid', verification.data.payment_info.tx_ref],
      );
      return res.json({ status: 'success' });
    }
    
    res.status(400).json({ status: 'failed' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

module.exports = router;