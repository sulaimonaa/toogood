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
      await db.query(
        'UPDATE visa_bookings SET payment_status = ? WHERE id = ?',
        ['Paid', verification.data.meta.booking_id]
      );
      return res.json({ status: 'success' });
    }
    
    res.status(400).json({ status: 'failed' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});


// Initialize payment
router.post('/initiate', async (req, res) => {
  try {
    const { email, amount, booking_id } = req.body;
    
    const payload = {
      tx_ref: `visa-${Date.now()}`,
      amount: amount,
      currency: 'NGN',
      redirect_url: 'https://toogoodtravels.net/payment-callback',
      customer: {
        email: email,
      },
      customizations: {
        title: 'Visa Support Booking',
        description: 'Payment for visa support services'
      },
      meta: {
        booking_id: booking_id
      }
    };

    const response = await flw.Payment.initialize(payload);
    res.json(response);
    
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
});

// Payment callback
router.get('/callback', async (req, res) => {
  try {
    const { transaction_id } = req.query;
    
    const response = await flw.Transaction.verify({ id: transaction_id });
    if (response.data.status === 'successful') {
      // Update booking payment status in database
      await db.query(
        'UPDATE visa_bookings SET payment_status = ? WHERE id = ?',
        ['paid', response.data.meta.booking_id]
      );
      return res.redirect('/payment-success');
    }
    
    res.redirect('/payment-failed');
  } catch (error) {
    console.error('Callback error:', error);
    res.redirect('/payment-error');
  }
});

module.exports = router;