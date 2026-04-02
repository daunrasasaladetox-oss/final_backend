const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const filePath = path.join(__dirname, '../data/prediksi.json');

function formatPrediksiItem(item) {
  return {
    gender: item.gender ?? item.nilai?.gender ?? item.input?.gender ?? '',
    age: Number(item.age ?? item.nilai?.age ?? item.input?.age ?? 0),
    bmi: Number(item.bmi ?? item.nilai?.bmi ?? item.input?.bmi ?? 0),
    HbA1c_level: Number(item.HbA1c_level ?? item.hba1c ?? item.nilai?.HbA1c_level ?? item.input?.HbA1c_level ?? 0),
    blood_glucose_level: Number(item.blood_glucose_level ?? item.glucoseLevel ?? item.nilai?.blood_glucose_level ?? item.input?.blood_glucose_level ?? 0),
    smoking_history: item.smoking_history ?? item.smokingHistory ?? item.nilai?.smoking_history ?? item.input?.smoking_history ?? '',
    prediction: item.prediction ?? item.hasil ?? ''
  };
}

// Ambil semua data prediksi (optional per-user)
router.get('/', (req, res) => {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]');
  let data = JSON.parse(fs.readFileSync(filePath));

  const userId = req.query.user_id;
  if (userId) {
    data = data.filter(p => String(p.user_id) === String(userId));
  }

  data.sort((a,b) => new Date(b.tanggal || b.createdAt || 0) - new Date(a.tanggal || a.createdAt || 0));
  res.json(data.map(formatPrediksiItem));
});

// Tambah data prediksi
router.post('/', (req, res) => {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]');
  const data = JSON.parse(fs.readFileSync(filePath));

  const payload = {
    id: Date.now(),
    gender: req.body.gender ?? req.body.nilai?.gender ?? '',
    age: Number(req.body.age ?? req.body.nilai?.age ?? 0),
    bmi: Number(req.body.bmi ?? req.body.nilai?.bmi ?? 0),
    HbA1c_level: Number(req.body.HbA1c_level ?? req.body.hba1c ?? req.body.nilai?.HbA1c_level ?? 0),
    blood_glucose_level: Number(req.body.blood_glucose_level ?? req.body.glucoseLevel ?? req.body.nilai?.blood_glucose_level ?? 0),
    smoking_history: req.body.smoking_history ?? req.body.smokingHistory ?? req.body.nilai?.smoking_history ?? '',
    prediction: req.body.prediction ?? req.body.hasil ?? ''
  };

  data.push(payload);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.status(201).json(formatPrediksiItem(payload));
});

module.exports = router;
