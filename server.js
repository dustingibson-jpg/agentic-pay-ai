require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  const lowerMsg = (message || '').toLowerCase();

  if (lowerMsg.includes('consultation') || lowerMsg.includes('developer')) {
    return res.json({
      reply: "I've structured a 1-Hour Technical AI Consultation package based on your request.",
      item: {
        name: "1-Hour Technical AI Consultation",
        price: "49.99",
        currency: "USD"
      },
      clientId: process.env.PAYPAL_CLIENT_ID || 'test'
    });
  }

  res.json({
    reply: "Hello! Tell me what product or technical service you need today.",
    clientId: process.env.PAYPAL_CLIENT_ID || 'test'
  });
});

app.listen(PORT, () => {
  console.log(`AgenticPay AI running on http://localhost:${PORT}`);
});