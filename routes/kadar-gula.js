const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const filePath = path.join(__dirname, '../data/kadar-gula.json');

// Ambil semua data kadar gula (optional per-user)
router.get('/', (req, res) => {
  let data = JSON.parse(fs.readFileSync(filePath));
  const userId = req.query.user_id;

  if (userId) {
    data = data.filter(k => String(k.user_id) === String(userId));
  }

  // Urutkan dari terbaru ke terlama berdasarkan waktu, fallback id
  data.sort((a, b) => {
    const aTime = a.waktu ? new Date(a.waktu).getTime() : a.id;
    const bTime = b.waktu ? new Date(b.waktu).getTime() : b.id;
    return bTime - aTime;
  });

  res.json(data);
});

// Tambah data kadar gula
router.post('/', (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  const newKadar = {
    id: Date.now(),
    ...req.body
  };
  data.push(newKadar);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.status(201).json(newKadar);
});

// Ambil data kadar gula berdasarkan ID
router.get('/:id', (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  const kadar = data.find(k => k.id == req.params.id);
  if (kadar) res.json(kadar);
  else res.status(404).json({ message: 'Data kadar gula tidak ditemukan' });
});

// Update data kadar gula
router.put('/:id', (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  const index = data.findIndex(k => k.id == req.params.id);
  if (index !== -1) {
    data[index] = { ...data[index], ...req.body };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    res.json(data[index]);
  } else {
    res.status(404).json({ message: 'Data kadar gula tidak ditemukan' });
  }
});

// Hapus data kadar gula
router.delete('/:id', (req, res) => {
  let data = JSON.parse(fs.readFileSync(filePath));
  const newData = data.filter(k => k.id != req.params.id);
  if (newData.length !== data.length) {
    fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));
    res.json({ message: 'Data kadar gula berhasil dihapus' });
  } else {
    res.status(404).json({ message: 'Data kadar gula tidak ditemukan' });
  }
});

module.exports = router;
