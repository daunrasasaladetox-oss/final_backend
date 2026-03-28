const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const filePath = path.join(__dirname, '../data/prediksi.json');

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

// Ambil semua data prediksi
router.get('/', (req, res) => {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]');
  const data = JSON.parse(fs.readFileSync(filePath));
  res.json(data);
});

// Tambah data prediksi dan hitung prediksi rule-based
router.post('/', (req, res) => {
  const rawGula = req.body.kadar_gula ?? req.body.gula ?? req.body.blood_glucose_level ?? req.body.glucose_level;
  const rawUsia = req.body.usia ?? req.body.age;

  const gula = Number(rawGula);
  const usia = rawUsia !== undefined ? Number(rawUsia) : NaN;

  if (!Number.isFinite(gula) || gula <= 0) {
    return res.status(400).json({
      error: 'Kadar gula harus diisi dan bernilai positif.'
    });
  }

  const hasil = prediksiDiabetes(gula);
  const catatan = buatCatatanUsia(usia, gula);

  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]');
  const data = JSON.parse(fs.readFileSync(filePath));
  const newPrediksi = {
    id: Date.now(),
    input: { ...req.body, kadar_gula: gula, usia: Number.isFinite(usia) ? usia : null },
    hasil: hasil.status,
    risiko: hasil.risiko,
    catatan,
    createdAt: new Date().toISOString()
  };

  data.push(newPrediksi);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.status(201).json(newPrediksi);
});

module.exports = router;
