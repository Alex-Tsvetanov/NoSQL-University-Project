const express = require('express');
const path = require('path');
const { connectToDatabase, closeConnection } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// API routes
app.get('/api', (req, res) => {
  res.json({
    message: 'IoT Fleet Tracking API',
    endpoints: {
      vehicles: '/vehicles',
      shipments: '/shipments',
      telemetry: '/telemetry',
      dashboard: '/dashboard'
    }
  });
});

// Vehicles routes
app.get('/vehicles', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const vehicles = await db.collection('vehicles').find({}).toArray();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Shipments routes
app.get('/shipments', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const shipments = await db.collection('shipments').find({}).toArray();
    res.json(shipments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Telemetry routes
app.get('/telemetry', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const telemetry = await db.collection('telemetry').find({}).toArray();
    res.json(telemetry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Dashboard available at: http://localhost:${PORT}/dashboard`);
  console.log(`API endpoints:`);
  console.log(`  - Vehicles: http://localhost:${PORT}/vehicles`);
  console.log(`  - Shipments: http://localhost:${PORT}/shipments`);
  console.log(`  - Telemetry: http://localhost:${PORT}/telemetry`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await closeConnection();
  process.exit(0);
});

module.exports = app;
