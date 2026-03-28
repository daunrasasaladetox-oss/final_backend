const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch'); // npm install node-fetch@2
const app = express();
const port = process.env.PORT || 3000;

// Import middleware
const { verifyToken } = require('./middleware/auth');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const userRoutes = require('./routes/users');
const obatRoutes = require('./routes/obat');
const prediksiRoutes = require('./routes/prediksi');
const kadarGulaRoutes = require('./routes/kadar-gula');

// Public routes (tidak perlu authentication)
app.use('/users', userRoutes);  // /users/login, POST /users (register)

// Protected routes (membutuhkan JWT token)
app.use('/obat', verifyToken, obatRoutes);
app.use('/prediksi', verifyToken, prediksiRoutes);
app.use('/kadar-gula', verifyToken, kadarGulaRoutes);

app.use(express.static(path.join(__dirname, 'public')));

// Root endpoint
app.get('/', (req, res) => {
  res.send('RESTful API is running! Version 2.0 with JWT Authentication');
});

// ML API Predict endpoint
app.post('/predict', verifyToken, async (req, res) => {
  try {
    console.log('📊 Data dari frontend:', req.body);
    
    const ML_API_URL = process.env.ML_API_URL || 'http://127.0.0.1:5501';
    
    // Kirim data ke ML API
    const mlResponse = await fetch(`${ML_API_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    if (!mlResponse.ok) {
      throw new Error(`ML API error: ${mlResponse.status}`);
    }
    
    const result = await mlResponse.json();
    
    // (Opsional) Simpan ke database/file di sini
    res.json({
      success: true,
      prediction: result,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('❌ Prediction error:', err.message);
    res.status(500).json({ 
      success: false,
      error: 'Gagal memproses prediksi',
      message: err.message,
      tip: 'Pastikan ML API running di port 5501'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling global
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({ 
    message: err.message || "Internal server error",
    timestamp: new Date().toISOString()
  });
});

// Redirect legacy endpoint
app.get('/kadargula', (req, res) => {
  res.redirect('https://backendta.vercel.app/kadar-gula');
});

// Export the app for serverless platforms (Vercel)
module.exports = app;

