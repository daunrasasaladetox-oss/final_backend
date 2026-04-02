const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const filePath = path.join(__dirname, '../data/reminders.json');

function ensureFile() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]', 'utf-8');
  }
}

// Get all reminders or per user
router.get('/', (req, res) => {
  ensureFile();
  const data = JSON.parse(fs.readFileSync(filePath));
  const userId = req.query.user_id;
  if (userId) {
    return res.json(data.filter(r => String(r.user_id) === String(userId)));
  }
  res.json(data);
});

// Create reminder
router.post('/', (req, res) => {
  ensureFile();
  const data = JSON.parse(fs.readFileSync(filePath));

  const payload = {
    id: Date.now(),
    user_id: req.body.user_id ?? null,
    obat_nama: req.body.obat_nama || '',
    dosis: req.body.dosis || '',
    schedule_time: req.body.schedule_time || '', // '08:00'
    repeat: req.body.repeat || 'daily', // optional
    is_active: req.body.is_active !== false,
    note: req.body.note || ''
  };

  data.push(payload);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.status(201).json(payload);
});

// Update reminder
router.put('/:id', (req, res) => {
  ensureFile();
  const data = JSON.parse(fs.readFileSync(filePath));
  const index = data.findIndex(r => r.id == req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Reminder tidak ditemukan' });

  data[index] = { ...data[index], ...req.body };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.json(data[index]);
});

// Delete reminder
router.delete('/:id', (req, res) => {
  ensureFile();
  const data = JSON.parse(fs.readFileSync(filePath));
  const newData = data.filter(r => r.id != req.params.id);
  if (newData.length === data.length) return res.status(404).json({ message: 'Reminder tidak ditemukan' });

  fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));
  res.json({ message: 'Reminder dihapus' });
});

module.exports = router;
