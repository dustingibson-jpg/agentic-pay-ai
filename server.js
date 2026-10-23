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
  const clientId = process.env.PAYPAL_CLIENT_ID || 'test';

  if (lowerMsg.includes('consultation') || lowerMsg.includes('developer')) {
    return res.json({
      reply: "I've structured a 1-Hour Technical AI Consultation package based on your request.",
      item: {
        name: "1-Hour Technical AI Consultation",
        price: "49.99",
        currency: "USD"
      },
      clientId
    });
  }

  if (lowerMsg.includes('credit') || lowerMsg.includes('api')) {
    return res.json({
      reply: "Here is the AI API Credits package tailored for your integration needs.",
      item: {
        name: "10,000 AI API Credits",
        price: "19.99",
        currency: "USD"
      },
      clientId
    });
  }

  if (lowerMsg.includes('cheap') || lowerMsg.includes('starter') || lowerMsg.includes('basic')) {
    return res.json({
      reply: "I found our entry-level Starter Plan for you.",
      item: {
        name: "Starter AI Tier",
        price: "9.99",
        currency: "USD"
      },
      clientId
    });
  }

  res.json({
    reply: "I can help you select a service package. Try asking for 'developer consultation', 'AI credits', or a 'starter plan'.",
    clientId
  });
});

app.listen(PORT, () => {
  console.log(`AgenticPay AI running on http://localhost:${PORT}`);
});