const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const filePath = path.join(__dirname, '../data/prediksi.json');

// Ambil semua data prediksi
router.get('/', (req, res) => {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]');
  const data = JSON.parse(fs.readFileSync(filePath));
  res.json(data);
});

// Tambah data prediksi
router.post('/', (req, res) => {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]');
  const data = JSON.parse(fs.readFileSync(filePath));
  const newPrediksi = { id: Date.now(), ...req.body };
  data.push(newPrediksi);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.status(201).json(newPrediksi);
});

module.exports = router;
