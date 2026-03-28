// ==================== DATABASE ABSTRACTION LAYER ====================
// This module provides abstraction for switching between JSON and SQLite storage
// 
// Usage:
//   In production: set STORAGE_TYPE=sqlite
//   In development: set STORAGE_TYPE=json (default)
//
// When using SQLite:
//   - DB_PATH: path to SQLite database file (default: ./data.db)
//   - Automatic table creation on first run
//

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const STORAGE_TYPE = process.env.STORAGE_TYPE || 'json';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data.db');

let db = null;

// ==================== INITIALIZATION ====================

function initSQLite() {
  console.log(`[DB] Using SQLite database: ${DB_PATH}`);
  db = new Database(DB_PATH);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Create tables if they don't exist  
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      nama TEXT NOT NULL,
      umur INTEGER,
      gender TEXT,
      email TEXT UNIQUE NOT NULL,
      no_telepon TEXT,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS obat (
      id INTEGER PRIMARY KEY,
      nama TEXT NOT NULL,
      dosis TEXT,
      tipe TEXT,
      harga INTEGER,
      deskripsi TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS kadar_gula (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL,
      nilai INTEGER,
      waktu DATETIME,
      keterangan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    CREATE TABLE IF NOT EXISTS prediksi (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      nilai TEXT,
      hasil BOOLEAN,
      probabilitas REAL,
      tanggal DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
  
  console.log('[DB] SQLite tables initialized');
}

// ==================== STORAGE OPERATIONS ====================

class Storage {
  static getStorageType() {
    return STORAGE_TYPE;
  }
  
  // ========== USERS ==========
  
  static getAllUsers() {
    if (STORAGE_TYPE === 'sqlite') {
      const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
      return stmt.all();
    } else {
      const filePath = path.join(__dirname, '../data/users.json');
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  }
  
  static getUserById(id) {
    if (STORAGE_TYPE === 'sqlite') {
      const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
      return stmt.get(id);
    } else {
      const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf8'));
      return data.find(u => u.id == id);
    }
  }
  
  static getUserByEmail(email) {
    if (STORAGE_TYPE === 'sqlite') {
      const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      return stmt.get(email);
    } else {
      const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf8'));
      return data.find(u => u.email === email);
    }
  }
  
  static createUser(user) {
    if (STORAGE_TYPE === 'sqlite') {
      const stmt = db.prepare(`
        INSERT INTO users (nama, umur, gender, email, no_telepon, password)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(
        user.nama, user.umur, user.gender, user.email, user.no_telepon, user.password
      );
      // Return created user with ID
      return { id: info.lastInsertRowid, ...user };
    } else {
      const filePath = path.join(__dirname, '../data/users.json');
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const newUser = { id: Date.now(), ...user };
      data.push(newUser);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return newUser;
    }
  }
  
  static updateUser(id, updates) {
    if (STORAGE_TYPE === 'sqlite') {
      const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
      const values = Object.values(updates);
      const stmt = db.prepare(`UPDATE users SET ${fields} WHERE id = ?`);
      stmt.run(...values, id);
      return this.getUserById(id);
    } else {
      const filePath = path.join(__dirname, '../data/users.json');
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const userIndex = data.findIndex(u => u.id == id);
      if (userIndex !== -1) {
        data[userIndex] = { ...data[userIndex], ...updates };
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return data[userIndex];
      }
      return null;
    }
  }
  
  // ========== OBAT ==========
  
  static getAllObat() {
    if (STORAGE_TYPE === 'sqlite') {
      const stmt = db.prepare('SELECT * FROM obat ORDER BY created_at DESC');
      return stmt.all();
    } else {
      const filePath = path.join(__dirname, '../data/obat.json');
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  }
  
  static getObatById(id) {
    if (STORAGE_TYPE === 'sqlite') {
      const stmt = db.prepare('SELECT * FROM obat WHERE id = ?');
      return stmt.get(id);
    } else {
      const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/obat.json'), 'utf8'));
      return data.find(o => o.id == id);
    }
  }
  
  static createObat(obat) {
    if (STORAGE_TYPE === 'sqlite') {
      const stmt = db.prepare(`
        INSERT INTO obat (nama, dosis, tipe, harga, deskripsi)
        VALUES (?, ?, ?, ?, ?)
      `);
      const info = stmt.run(obat.nama, obat.dosis, obat.tipe, obat.harga, obat.deskripsi);
      return { id: info.lastInsertRowid, ...obat };
    } else {
      const filePath = path.join(__dirname, '../data/obat.json');
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const newObat = { id: Date.now(), ...obat };
      data.push(newObat);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return newObat;
    }
  }
  
  static updateObat(id, updates) {
    if (STORAGE_TYPE === 'sqlite') {
      const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
      const values = Object.values(updates);
      const stmt = db.prepare(`UPDATE obat SET ${fields} WHERE id = ?`);
      stmt.run(...values, id);
      return this.getObatById(id);
    } else {
      const filePath = path.join(__dirname, '../data/obat.json');
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const index = data.findIndex(o => o.id == id);
      if (index !== -1) {
        data[index] = { ...data[index], ...updates };
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return data[index];
      }
      return null;
    }
  }
  
  static deleteObat(id) {
    if (STORAGE_TYPE === 'sqlite') {
      const stmt = db.prepare('DELETE FROM obat WHERE id = ?');
      const info = stmt.run(id);
      return info.changes > 0;
    } else {
      const filePath = path.join(__dirname, '../data/obat.json');
      let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const originalLength = data.length;
      data = data.filter(o => o.id != id);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return originalLength !== data.length;
    }
  }
  
  // ========== KADAR GULA ==========
  
  static getAllKadarGula() {
    if (STORAGE_TYPE === 'sqlite') {
      const stmt = db.prepare('SELECT * FROM kadar_gula ORDER BY created_at DESC');
      return stmt.all();
    } else {
      const filePath = path.join(__dirname, '../data/kadar-gula.json');
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  }
  
  static getKadarGulaById(id) {
    if (STORAGE_TYPE === 'sqlite') {
      const stmt = db.prepare('SELECT * FROM kadar_gula WHERE id = ?');
      return stmt.get(id);
    } else {
      const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/kadar-gula.json'), 'utf8'));
      return data.find(k => k.id == id);
    }
  }
  
  static createKadarGula(kadar) {
    if (STORAGE_TYPE === 'sqlite') {
      const stmt = db.prepare(`
        INSERT INTO kadar_gula (user_id, nilai, waktu, keterangan)
        VALUES (?, ?, ?, ?)
      `);
      const info = stmt.run(kadar.user_id, kadar.nilai, kadar.waktu, kadar.keterangan);
      return { id: info.lastInsertRowid, ...kadar };
    } else {
      const filePath = path.join(__dirname, '../data/kadar-gula.json');
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const newKadar = { id: Date.now(), ...kadar };
      data.push(newKadar);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return newKadar;
    }
  }
  
  static updateKadarGula(id, updates) {
    if (STORAGE_TYPE === 'sqlite') {
      const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
      const values = Object.values(updates);
      const stmt = db.prepare(`UPDATE kadar_gula SET ${fields} WHERE id = ?`);
      stmt.run(...values, id);
      return this.getKadarGulaById(id);
    } else {
      const filePath = path.join(__dirname, '../data/kadar-gula.json');
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const index = data.findIndex(k => k.id == id);
      if (index !== -1) {
        data[index] = { ...data[index], ...updates };
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return data[index];
      }
      return null;
    }
  }
  
  static deleteKadarGula(id) {
    if (STORAGE_TYPE === 'sqlite') {
      const stmt = db.prepare('DELETE FROM kadar_gula WHERE id = ?');
      const info = stmt.run(id);
      return info.changes > 0;
    } else {
      const filePath = path.join(__dirname, '../data/kadar-gula.json');
      let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const originalLength = data.length;
      data = data.filter(k => k.id != id);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return originalLength !== data.length;
    }
  }
  
  // ========== PREDIKSI ==========
  
  static getAllPrediksi() {
    if (STORAGE_TYPE === 'sqlite') {
      const stmt = db.prepare('SELECT * FROM prediksi ORDER BY created_at DESC');
      return stmt.all();
    } else {
      const filePath = path.join(__dirname, '../data/prediksi.json');
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  }
  
  static createPrediksi(pred) {
    if (STORAGE_TYPE === 'sqlite') {
      const stmt = db.prepare(`
        INSERT INTO prediksi (user_id, nilai, hasil, probabilitas, tanggal)
        VALUES (?, ?, ?, ?, ?)
      `);
      const info = stmt.run(pred.user_id, JSON.stringify(pred.nilai), pred.hasil, pred.probabilitas, pred.tanggal);
      return { id: info.lastInsertRowid, ...pred };
    } else {
      const filePath = path.join(__dirname, '../data/prediksi.json');
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const newPred = { id: Date.now(), ...pred };
      data.push(newPred);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return newPred;
    }
  }
}

// Initialize storage
if (STORAGE_TYPE === 'sqlite') {
  initSQLite();
}

module.exports = { Storage, db };
