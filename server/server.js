require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const apiRoutes = require('./src/routes/apiRoutes');
const mockPortalRoutes = require('./src/routes/mockPortalRoutes');
const { seedInitialData } = require('./src/seed/seedData');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes
app.use('/api', apiRoutes);
app.use('/mock-portals', mockPortalRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Samanvay – Unified Government Digital Services Integration Platform',
    version: '1.0.0',
    institution: 'Medicaps University, Indore',
    problemStatement: 'SIH26129 - System integration and interoperability among government digital platforms',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend build if exists
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// Fallback handler for SPA client
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/mock-portals')) {
    return next();
  }
  const indexPath = path.join(clientBuildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(200).send(`
    <html>
      <head><title>Samanvay Gateway API</title></head>
      <body style="font-family: sans-serif; padding: 40px; text-align: center;">
        <h1 style="color: #1e3a8a;">Samanvay (UGDS) Backend API Gateway</h1>
        <p>API is running smoothly on port ${PORT}. Run the Vite frontend on port 3000 or build the client.</p>
        <p><a href="/health">View Health Status</a> | <a href="/mock-portals/config">Mock Portals Config</a></p>
      </body>
    </html>
  `);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server and Seed Data
app.listen(PORT, async () => {
  console.log(`================================================================`);
  console.log(` SAMANVAY - Unified Government Digital Services (UGDS)`);
  console.log(` SIH 2026 Problem Statement 26129 - Government of Maharashtra`);
  console.log(` Developed by: Aarya Jain (EN23CS301016) & Aashiya Khan (EN23CS301022)`);
  console.log(` Guide: Prof. Rashmi Vijaywargiya | Medicaps University, Indore`);
  console.log(`================================================================`);
  console.log(` API Gateway running on: http://localhost:${PORT}`);
  console.log(` Mock Portals running on: http://localhost:${PORT}/mock-portals`);
  console.log(`================================================================`);

  try {
    await seedInitialData();
  } catch (err) {
    console.error('Error during database seed:', err);
  }
});
