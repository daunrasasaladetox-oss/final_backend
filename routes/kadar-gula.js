const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const filePath = path.join(__dirname, '../data/kadar-gula.json');

function formatKadarGulaItem(item) {
  // Ambil tanggal dan waktu langsung dari input frontend (jika ada),
  // atau dari field waktu/jam yang tersedia.
  const tanggal = item.tanggal || '';
  const waktu = item.waktu || item.jam || '';
  const kadarGula = item.kadar_gula ?? item.nilai ?? item.value ?? null;

  return {
    id: item.id,
    user_id: item.user_id ?? null,
    tanggal,
    waktu,
    kadar_gula: Number(kadarGula)
  };
}

// Ambil semua data kadar gula (optional per-user)
router.get('/', (req, res) => {
  let data = JSON.parse(fs.readFileSync(filePath));
  const userId = req.query.user_id;

  if (userId) {
    data = data.filter(k => String(k.user_id) === String(userId));
  }

  // Urutkan dari terbaru ke terlama berdasarkan gabungan tanggal+waktu.
  data.sort((a, b) => {
    const aDate = a.tanggal && a.waktu ? new Date(`${a.tanggal}T${a.waktu}:00`) : new Date(a.id);
    const bDate = b.tanggal && b.waktu ? new Date(`${b.tanggal}T${b.waktu}:00`) : new Date(b.id);
    return bDate.getTime() - aDate.getTime();
  });

  res.json(data.map(formatKadarGulaItem));
});

// Tambah data kadar gula
router.post('/', (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath));

  const newKadar = {
    id: Date.now(),
    user_id: req.body.user_id || null,
    tanggal: req.body.tanggal || '',
    waktu: req.body.waktu || req.body.jam || '',
    kadar_gula: Number(req.body.kadar_gula ?? req.body.nilai ?? req.body.value ?? 0)
  };

  data.push(newKadar);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.status(201).json(formatKadarGulaItem(newKadar));
});


// Ambil data kadar gula berdasarkan ID
router.get('/:id', (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  const kadar = data.find(k => k.id == req.params.id);
  if (kadar) res.json(formatKadarGulaItem(kadar));
  else res.status(404).json({ message: 'Data kadar gula tidak ditemukan' });
});

// Update data kadar gula
router.put('/:id', (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  const index = data.findIndex(k => k.id == req.params.id);
  if (index !== -1) {
    data[index] = { ...data[index], ...req.body };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    res.json(formatKadarGulaItem(data[index]));
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
