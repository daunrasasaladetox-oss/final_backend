const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const filePath = path.join(__dirname, '../data/obat.json');

// Baca semua data obat
router.get('/', (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  res.json(data);
});

// Tambah data obat
router.post('/', (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  const newObat = {
    id: Date.now(),
    ...req.body
  };
  data.push(newObat);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.status(201).json(newObat);
});

// Ambil obat berdasarkan ID
router.get('/:id', (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  const obat = data.find(o => o.id == req.params.id);
  if (obat) res.json(obat);
  else res.status(404).json({ message: 'Obat tidak ditemukan' });
});

// Update data obat
router.put('/:id', (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  const index = data.findIndex(o => o.id == req.params.id);
  if (index !== -1) {
    data[index] = { ...data[index], ...req.body };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    res.json(data[index]);
  } else {
    res.status(404).json({ message: 'Obat tidak ditemukan' });
  }
});

// Hapus data obat
router.delete('/:id', (req, res) => {
  let data = JSON.parse(fs.readFileSync(filePath));
  const newData = data.filter(o => o.id != req.params.id);
  if (newData.length !== data.length) {
    fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));
    res.json({ message: 'Obat berhasil dihapus' });
  } else {
    res.status(404).json({ message: 'Obat tidak ditemukan' });
  }
});

module.exports = router;
