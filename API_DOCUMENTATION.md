# 🩺 Diabetes Prediction API - Documentation

## Overview
Backend REST API untuk aplikasi prediksi diabetes dengan fitur:
- ✅ User authentication dengan JWT
- ✅ Password encryption (bcryptjs)
- ✅ User management
- ✅ Medication tracking
- ✅ Blood sugar monitoring
- ✅ Diabetes prediction integration dengan ML API

**Version:** 2.0  
**Last Updated:** February 27, 2026

---

## 🚀 Quick Start

### Installation
```bash
cd backend
npm install
```

### Configuration
1. Copy `.env.example` ke `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` dan set `JWT_SECRET`:
```env
JWT_SECRET=your-super-secret-key-here
ML_API_URL=http://127.0.0.1:5501
```

### Run Server
```bash
npm start
# Server running on http://localhost:3000
```

---

## 🔐 Authentication

### JWT Token
Semua endpoint kecuali `/users` dan `/users/login` memerlukan authorization header:

```
Authorization: Bearer <token>
```

### Token Format
Token valid untuk **24 jam**. Token expired akan mengembalikan status 401.

---

## 📋 API Endpoints

### 1. USER MANAGEMENT

#### Register / Sign Up
```http
POST /users
Content-Type: application/json

{
  "nama": "John Doe",
  "umur": 30,
  "gender": "Male",
  "email": "john@example.com",
  "no_telepon": "0812345678",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "id": 1772193486759,
  "nama": "John Doe",
  "umur": 30,
  "gender": "Male",
  "email": "john@example.com",
  "no_telepon": "0812345678"
}
```

**Error (400):** Email sudah terdaftar

---

#### Login / Sign In
```http
POST /users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1772193486759,
    "nama": "John Doe",
    "email": "john@example.com",
    "umur": 30,
    "gender": "Male",
    "no_telepon": "0812345678"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login berhasil"
}
```

**Error (401):** Email atau password salah

---

#### Get All Users (Public)
```http
GET /users
```

**Response (200):**
```json
[
  {
    "id": 1772193486759,
    "nama": "John Doe",
    "email": "john@example.com",
    "umur": 30,
    "gender": "Male",
    "no_telepon": "0812345678"
  }
]
```

---

#### Get User Profile
```http
GET /users/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1772193486759,
  "nama": "John Doe",
  "email": "john@example.com",
  "umur": 30,
  "gender": "Male",
  "no_telepon": "0812345678"
}
```

**Error (404):** User tidak ditemukan

---

#### Update User Profile
```http
PUT /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "nama": "John Updated",
  "umur": 31,
  "no_telepon": "0899876543"
  // Optional: "password": "newPassword123"
}
```

**Response (200):** Updated user data

---

### 2. MEDICATION ENDPOINTS

Semua endpoint memerlukan `Authorization: Bearer <token>`

#### Get All Medications
```http
GET /obat
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1772193486898,
    "nama": "Metformin",
    "dosis": "500mg",
    "tipe": "Oral",
    "harga": 25000,
    "deskripsi": "Obat untuk mengontrol diabetes"
  }
]
```

---

#### Add New Medication
```http
POST /obat
Authorization: Bearer <token>
Content-Type: application/json

{
  "nama": "Metformin",
  "dosis": "500mg",
  "tipe": "Oral",
  "harga": 25000,
  "deskripsi": "Obat untuk mengontrol diabetes"
}
```

**Response (201):** Created medication

---

#### Get Specific Medication
```http
GET /obat/:id
Authorization: Bearer <token>
```

**Response (200):** Medication data

---

#### Update Medication
```http
PUT /obat/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "harga": 30000,
  "dosis": "750mg"
}
```

**Response (200):** Updated medication

---

#### Delete Medication
```http
DELETE /obat/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Obat berhasil dihapus"
}
```

---

### 3. BLOOD SUGAR ENDPOINTS

Semua endpoint memerlukan `Authorization: Bearer <token>`

#### Get All Records
```http
GET /kadar-gula
Authorization: Bearer <token>
```

**Response (200):** Array of blood sugar records

---

#### Record Blood Sugar Level
```http
POST /kadar-gula
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": 1,
  "nilai": 120,
  "waktu": "2026-02-27T12:30:00Z",
  "keterangan": "Sesudah makan"
}
```

**Response (201):** Created record

---

#### Get Specific Record
```http
GET /kadar-gula/:id
Authorization: Bearer <token>
```

**Response (200):** Blood sugar record

---

#### Update Record
```http
PUT /kadar-gula/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "nilai": 125,
  "keterangan": "Sesudah makan (Updated)"
}
```

**Response (200):** Updated record

---

#### Delete Record
```http
DELETE /kadar-gula/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Data kadar gula berhasil dihapus"
}
```

---

### 4. PREDICTION ENDPOINTS

Semua endpoint memerlukan `Authorization: Bearer <token>`

#### Get All Predictions
```http
GET /prediksi
Authorization: Bearer <token>
```

**Response (200):** Array of predictions

---

#### Save Prediction Result
```http
POST /prediksi
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": 1,
  "nilai": {
    "age": 35,
    "bmi": 28.5,
    "blood_glucose_level": 145,
    "HbA1c_level": 7.2
  },
  "hasil": false,
  "probabilitas": "45.32",
  "tanggal": "2026-02-27T12:00:00Z"
}
```

**Response (201):** Created prediction

---

#### Get ML Prediction
```http
POST /predict
Authorization: Bearer <token>
Content-Type: application/json

{
  "age": 35,
  "bmi": 28.5,
  "blood_glucose_level": 145,
  "gender": "Male",
  "smoking_history": "No",
  "HbA1c_level": 7.2
}
```

**Response (200):**
```json
{
  "success": true,
  "prediction": {
    "result": false,
    "probability": 45.32
  },
  "timestamp": "2026-02-27T12:00:00.000Z"
}
```

**Error (500):** 
- ML API tidak running
- Parameter tidak valid

---

## 🔧 Setup ML API

### Requirement
- Python 3.8+
- FastAPI
- TensorFlow/Keras

### Installation
```bash
cd ml
pip install -r requirements.txt
```

### Run ML API
```bash
python main.py
# Server running on http://127.0.0.1:5501
```

### ML API Endpoint
```
POST http://127.0.0.1:5501/predict
```

---

## 📊 Authentication Flow

### 1. Register
```
POST /users → Create account
```

### 2. Login
```
POST /users/login → Receive JWT token
```

### 3. Access Protected Routes
```
GET /obat + Authorization: Bearer <token>
```

### 4. Token Expiry
```
After 24 hours → 401 Unauthorized
→ User must login again
```

---

## 🗂️ File Structure

```
backend/
├── app.js                 # Main server file
├── package.json          # Dependencies
├── .env.example          # Environment config template
├── middleware/
│   └── auth.js           # JWT verification middleware
├── routes/
│   ├── users.js          # User auth & management
│   ├── obat.js           # Medication management
│   ├── kadar-gula.js     # Blood sugar tracking
│   └── prediksi.js       # Predictions
└── data/
    ├── users.json        # User database (JSON)
    ├── obat.json         # Medications database
    ├── kadar-gula.json   # Blood sugar records
    └── prediksi.json     # Predictions database
```

---

## 🔒 Security Features

### ✅ Password Encryption
- Using **bcryptjs** (v3.0.3)
- Hash rounds: 10
- Password never stored in plain text

### ✅ JWT Authentication
- Using **jsonwebtoken** (v9.0.3)
- Token expiry: 24 hours
- Signature verification on each request
- Secret key (change in production!)

### ✅ Protected Routes
- `/users` register & login: Public
- All other endpoints: Require valid JWT

### ⚠️ Notes
- Change `JWT_SECRET` in `.env` for production
- Use HTTPS in production
- Implement rate limiting
- Add input validation
- Add CSRF protection

---

## 📝 Testing

### Using cURL
```bash
# Register
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"nama":"John","email":"john@test.com","password":"pass123","umur":30,"gender":"Male","no_telepon":"0812345"}'

# Login
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'

# Access protected route
curl -X GET http://localhost:3000/obat \
  -H "Authorization: Bearer <token>"
```

### Using Node.js Test Script
```bash
node test-api.js
```

---

## 🚀 Deployment

### Docker
```bash
docker build -t diabetes-api .
docker run -p 3000:3000 diabetes-api
```

### Environment Variables
```env
JWT_SECRET=change-this-in-production
ML_API_URL=http://ml-api:5501
NODE_ENV=production
```

---

## 🐛 Troubleshooting

### "Token tidak valid"
- Token sudah expired → Login kembali
- Token format salah → Gunakan `Authorization: Bearer <token>`
- JWT_SECRET berbeda → Pastikan .env sesuai

### "Email atau password salah"
- Periksa email terdaftar dengan benar
- Password case-sensitive
- Password yang disimpan sudah di-hash

### "ML API tidak merespons"
- Cek ML API running di port 5501
- Cek ML_API_URL di .env
- Cek network connectivity

---

## 📞 Support
For issues or questions, please contact development team.

---

**Version 2.0 - With JWT & Password Encryption**
