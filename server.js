require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to retrieve OAuth access token from PayPal REST API
async function getPayPalAccessToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal Client ID and Secret must be set in .env file');
  }
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  const data = await response.json();
  return data.access_token;
}

// Conversational AI Intent Engine
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  const lowerMsg = (message || '').toLowerCase();
  const clientId = PAYPAL_CLIENT_ID || 'test';

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

// Server-Side PayPal Order Creation
app.post('/api/orders', async (req, res) => {
  try {
    const { item } = req.body;
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          description: item.name,
          amount: {
            currency_code: item.currency || 'USD',
            value: item.price,
          },
        }],
      }),
    });
    const order = await response.json();
    res.json(order);
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Server-Side PayPal Order Capture
app.post('/api/orders/:orderID/capture', async (req, res) => {
  try {
    const { orderID } = req.params;
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    const captureData = await response.json();
    res.json(captureData);
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`AgenticPay AI running on http://localhost:${PORT}`);
});