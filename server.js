const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  const data = await response.json();
  return data.access_token;
}

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const lower = message.toLowerCase();

  let reply = "I can assist you with products or services. Try asking for 'developer consultation', 'cloud hosting', or 'AI API credits'.";
  let item = null;

  if (lower.includes('consult') || lower.includes('advice') || lower.includes('developer')) {
    reply = "I've structured a 1-Hour Technical AI Consultation package based on your request.";
    item = { name: "1-Hour Technical AI Consultation", price: "49.99" };
  } else if (lower.includes('credit') || lower.includes('api') || lower.includes('token')) {
    reply = "Here is an optimized starter tier for AI API credits.";
    item = { name: "AI API Credit Starter Tier (10M Tokens)", price: "19.99" };
  } else if (lower.includes('hosting') || lower.includes('server') || lower.includes('cloud')) {
    reply = "I've configured a Managed Cloud Node for your project.";
    item = { name: "Managed Cloud Node - Monthly Tier", price: "29.99" };
  }

  res.json({ reply, item, paypalClientId: PAYPAL_CLIENT_ID });
});

app.post('/api/create-paypal-order', async (req, res) => {
  try {
    const { item } = req.body;
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          description: item.name,
          amount: { currency_code: 'USD', value: item.price }
        }]
      })
    });

    const order = await response.json();
    res.json({ id: order.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/capture-paypal-order', async (req, res) => {
  try {
    const { orderID } = req.body;
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const captureData = await response.json();
    res.json(captureData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AgenticPay AI running on http://localhost:${PORT}`));