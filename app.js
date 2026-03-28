const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Import middleware
const { verifyToken } = require('./middleware/auth');

// Prediksi rule-based (mengikuti logika skenario diabetes):
function prediksiDiabetes(gula) {
  if (gula < 100) {
    return { status: 'Normal', risiko: 'Rendah' };
  } else if (gula >= 100 && gula <= 125) {
    return { status: 'Prediabetes', risiko: 'Sedang' };
  } else {
    return { status: 'Diabetes', risiko: 'Tinggi' };
  }
}

function buatCatatanUsia(usia, gula) {
  if (!Number.isFinite(usia)) return null;
  if (usia >= 18 && usia <= 40 && gula >= 126) {
    return 'Perlu perhatian khusus (usia produktif berisiko tinggi)';
  }
  return null;
}

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

// Prediksi endpoint rule-based sesuai skripsi
app.post('/predict', verifyToken, (req, res) => {
  try {
    console.log('📊 Data dari frontend (predict):', req.body);

    const rawGula = req.body.blood_glucose_level ?? req.body.glucose_level ?? req.body.kadar_gula ?? req.body.gula;
    const rawUsia = req.body.age ?? req.body.usia;

    const gula = Number(rawGula);
    const usia = rawUsia !== undefined ? Number(rawUsia) : NaN;

    if (!Number.isFinite(gula) || gula <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Parameter kadar gula darah diperlukan dan harus positif.',
        received: rawGula
      });
    }

    const hasil = prediksiDiabetes(gula);
    const catatan = buatCatatanUsia(usia, gula);

    const response = {
      success: true,
      input: { gula, usia: Number.isFinite(usia) ? usia : null },
      prediction: hasil.status,
      risiko: hasil.risiko,
      details: {
        kondisi: hasil.status,
        risiko: hasil.risiko,
        catatan: catatan
      },
      from: 'rule-based',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (err) {
    console.error('❌ Prediction error:', err);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada prediksi backend',
      error: err.message
    });
  }
});

// ML service/readiness health endpoint (rule-based)
app.get('/ml-health', (req, res) => {
  res.json({
    status: 'up',
    mlApiUrl: 'rule-based',
    message: 'Backend prediksi rule-based aktif'
  });
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

// Jalankan server hanya bila file ini dijalankan langsung (non-serverless)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Export the app untuk serverless platforms (Vercel)
module.exports = app;

