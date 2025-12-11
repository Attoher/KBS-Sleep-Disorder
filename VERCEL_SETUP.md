# Sleep Health KBS - Vercel Deployment Setup Guide

## Step-by-Step Setup untuk Vercel

### STEP 1: Persiapan di GitHub ✅
```bash
# Pastikan semua sudah di-push ke main branch
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

---

### STEP 2: Buka Vercel dan Import Repository ✅

1. Buka: https://vercel.com
2. Sign in dengan GitHub account
3. Klik "Add New" → "Project"
4. Pilih repository "KBS-Sleep-Disorder"
5. Klik "Import"

---

### STEP 3: Configure Build Settings ✅

Di halaman "Configure Project":

**Framework Preset:** Vite
**Root Directory:** `frontend`
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`

Klik **Deploy** (atau Save dulu jika mau set env terlebih dahulu)

---

### STEP 4: Set Environment Variables ✅ ⭐ PENTING

Di **Project Settings → Environment Variables**, tambahkan semua variable ini:

#### **BACKEND VARIABLES:**

| Variable | Value |
|----------|-------|
| `PORT` | `5000` |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | `(generate: openssl rand -base64 32)` |
| `APP_URL` | `https://your-vercel-project.vercel.app` |

#### **NEO4J AURA (sudah punya):**

| Variable | Value |
|----------|-------|
| `NEO4J_URI` | `neo4j+s://1ddeb3bf.databases.neo4j.io` |
| `NEO4J_USERNAME` | `neo4j` |
| `NEO4J_PASSWORD` | `BoX-qrO5bDDHAb5OwY45GsRfVSb_Sz1OfvGqNVnzLi4` |
| `NEO4J_DATABASE` | `neo4j` |
| `AURA_INSTANCEID` | `1ddeb3bf` |
| `AURA_INSTANCENAME` | `SleepDisorder` |

#### **CORS & FRONTEND:**

| Variable | Value |
|----------|-------|
| `FRONTEND_URL` | `https://your-vercel-project.vercel.app` |
| `CORS_ORIGIN` | `https://your-vercel-project.vercel.app` |
| `VITE_API_URL` | `https://your-vercel-project.vercel.app/api` |
| `VITE_API_BASE_URL` | `https://your-vercel-project.vercel.app` |

#### **DATABASE (Optional - gunakan SQLite untuk demo):**

```
SQLITE_PATH=./data/auth.db
ALLOW_OFFLINE=true
```

Atau jika punya PostgreSQL:

| Variable | Value |
|----------|-------|
| `DB_HOST` | `your-postgres-host` |
| `DB_PORT` | `5432` |
| `DB_NAME` | `sleep_health_db` |
| `DB_USER` | `postgres-user` |
| `DB_PASSWORD` | `postgres-password` |

#### **FEATURE FLAGS:**

| Variable | Value |
|----------|-------|
| `DEMO_MODE` | `false` |
| `ALLOW_OFFLINE` | `false` (set true jika tidak ada database) |

---

### STEP 5: Deploy! 🚀

1. Klik tombol **Deploy**
2. Tunggu proses build (5-15 menit)
3. Vercel akan notify ketika selesai
4. Cek status di dashboard

---

### STEP 6: Test Deployment ✅

```bash
# Test Frontend
curl https://your-vercel-project.vercel.app

# Test Backend Health
curl https://your-vercel-project.vercel.app/api/health

# Expected response:
# {
#   "status": "ok",
#   "services": { "neo4j": "ok" },
#   "uptime": 123456
# }
```

---

## ENV Variables Lengkap untuk Copy-Paste

### Backend (.env untuk Vercel)

```env
# Server
PORT=5000
NODE_ENV=production
APP_URL=https://your-vercel-project.vercel.app

# JWT
JWT_SECRET=ba0c5e7b2e4d4c6da9a1efc5a0cf0d523c4d8a0b7d27e1b2a4f8c9d61e0b2f3c
JWT_EXPIRES_IN=7d

# Neo4j Aura
NEO4J_URI=neo4j+s://1ddeb3bf.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=BoX-qrO5bDDHAb5OwY45GsRfVSb_Sz1OfvGqNVnzLi4
NEO4J_DATABASE=neo4j

# Aura Info
AURA_INSTANCEID=1ddeb3bf
AURA_INSTANCENAME=SleepDisorder

# CORS
FRONTEND_URL=https://your-vercel-project.vercel.app
CORS_ORIGIN=https://your-vercel-project.vercel.app

# Database (SQLite untuk demo)
SQLITE_PATH=./data/auth.db
ALLOW_OFFLINE=true

# Feature Flags
DEMO_MODE=false
```

### Frontend (.env untuk Vercel)

```env
# API
VITE_API_URL=https://your-vercel-project.vercel.app/api
VITE_API_BASE_URL=https://your-vercel-project.vercel.app

# App Info
VITE_APP_NAME=Sleep Health KBS
VITE_APP_VERSION=1.0.0

# Debug (set false di production)
VITE_DEBUG=false
```

---

## Urutan Setup Yang Benar:

1. ✅ Push code ke GitHub (main branch)
2. ✅ Buka Vercel dan import repository
3. ✅ Pilih `frontend` sebagai root directory
4. ✅ Set build command: `npm run build`
5. ✅ **ADD ALL ENVIRONMENT VARIABLES** (lihat tabel di atas)
6. ✅ Click Deploy
7. ✅ Tunggu selesai (5-15 menit)
8. ✅ Test di browser dan API endpoints

---

## Ganti `your-vercel-project` dengan:

Setelah project terbuat, Vercel akan kasih URL seperti:
```
https://kbs-sleep-disorder.vercel.app
```

Gunakan URL ini untuk semua environment variables yang butuh domain.

---

## Common Issues & Solutions:

### Build Fails
- ✅ Check build logs di Vercel dashboard
- ✅ Pastikan semua dependencies ada di package.json

### API Returns 500
- ✅ Check Neo4j credentials benar
- ✅ Pastikan NEO4J_URI bisa diakses dari Vercel
- ✅ Wait 60 detik jika Aura baru dibuat

### CORS Errors
- ✅ Update FRONTEND_URL dan CORS_ORIGIN dengan URL Vercel yang benar

### Hot Reload Issues
- ✅ Gunakan `npm run dev` untuk development (tidak untuk Vercel)
- ✅ Vercel production bukan hot reload

---

## After Deployment:

1. Test semua endpoints:
   - Login: `POST /api/auth/login`
   - Screening: `POST /api/screening/process`
   - History: `GET /api/history`
   - Analytics: `GET /api/analytics/overview`

2. Check monitoring di Vercel dashboard

3. Setup custom domain (optional):
   - Vercel → Project Settings → Domains
   - Add your custom domain

4. Enable automatic deployments:
   - Vercel automatically deploys on `git push origin main`

---

## Helpful Links:

- Vercel Dashboard: https://vercel.com/dashboard
- Project Logs: https://vercel.com/dashboard/[project-name]/logs
- Neo4j Console: https://console.neo4j.io
- Your Deployed App: https://your-vercel-project.vercel.app

---

## Tips:

- ✅ Selalu test di staging sebelum production
- ✅ Monitor logs di Vercel dashboard
- ✅ Backup Neo4j data secara regular
- ✅ Keep JWT_SECRET aman dan rahasia
- ✅ Use strong passwords untuk database

Selesai! Project sudah live di Vercel! 🎉
