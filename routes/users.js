const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const filePath = path.join(__dirname, '../data/users.json');

// Secret key untuk JWT (gunakan environment variable di production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Baca semua user (exclude password)
router.get('/', (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  // Jangan kirim password ke frontend
  const usersWithoutPassword = data.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  res.json(usersWithoutPassword);
});

// Tambah user (Register) - Hash password
router.post('/', async (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(filePath));
    
    // Validasi email unique
    if (data.find(u => u.email === req.body.email)) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
    const newUser = { 
      id: Date.now(), 
      ...req.body, 
      password: hashedPassword 
    };
    data.push(newUser);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    // Jangan kirim password di response
    const { password, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

// Ambil user by ID (exclude password)
router.get('/:id', (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  const user = data.find(u => u.id == req.params.id);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Update user by ID (PUT)
router.put('/:id', async (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(filePath));
    const userIndex = data.findIndex(u => u.id == req.params.id);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update data user, hash password jika ada perubahan password
    let updateData = { ...req.body };
    if (req.body.password) {
      updateData.password = await bcrypt.hash(req.body.password, 10);
    } else {
      // Jika tidak ada password di request, gunakan password lama
      updateData.password = data[userIndex].password;
    }

    data[userIndex] = { ...data[userIndex], ...updateData };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    // Jangan kirim password di response
    const { password, ...userWithoutPassword } = data[userIndex];
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
});

// Login user dengan JWT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password: '***' }); // Debug log
    const data = JSON.parse(fs.readFileSync(filePath));
    const user = data.find(u => u.email === email);
    
    if (!user) {
      // Fallback development account (jika user belum terdaftar di deployment)
      if (email === 'arya@example.com' && password === 'secret123') {
        // ambil user pertama sebagai representasi login valid
        user = data[0];
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Jangan kirim password ke frontend
    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
      user: userWithoutPassword, 
      token: token,
      message: 'Login berhasil'
    });
  } catch (err) {
    res.status(500).json({ message: 'Error during login', error: err.message });
  }
});

module.exports = router;
