// server.js
// Small Express server with dotenv support and corrected variable usage.

require('dotenv').config(); // Load .env into process.env when present

const express = require('express');
const session = require('express-session');
const vegetables = require('./data/vegetables');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-session-secret';

const app = express();
app.use(express.json());

// Basic session setup - in production make sure to use secure cookies and a store
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Health / info endpoint
app.get('/', (req, res) => {
  const businessName = process.env.BUSINESS_NAME || 'Veg Shop';
  res.send({
    message: `Welcome to ${businessName}`,
    note: 'This server is configured via environment variables (see .env.example)'
  });
});

// Return sample vegetables
app.get('/api/vegetables', (req, res) => {
  res.json(vegetables);
});

// Example endpoint to create a simple contract object
app.post('/api/contracts', (req, res) => {
  // Fix: use businessName for the customer name when provided
  // Accept either businessName or customerName from clients for compatibility
  const businessName = req.body.businessName || req.body.customerName || process.env.BUSINESS_NAME || 'Anonymous Customer';

  // Fix: ensure contractRates variable is defined and falls back sensibly
  const contractRates = req.body.contractRates || req.body.rates || { monthly: 0, perItem: 0 };

  const contract = {
    id: Date.now(),
    customerName: businessName,
    rates: contractRates,
    createdAt: new Date().toISOString()
  };

  // In real app, save to DB. Here we just return to caller.
  res.status(201).json({ contract });
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
