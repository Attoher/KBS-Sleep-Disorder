# Backend Deployment ke Vercel

## Masalah: Frontend + Backend di Vercel

Vercel bisa host:
- ✅ **Frontend** (React, Next.js, Vite) → Optimal
- ⚠️ **Backend** (Node.js, Express) → Limited (serverless functions)

---

## Opsi Deployment Backend:

### **OPSI 1: Backend di Vercel (Recommended untuk Hobby)**

Vercel bisa host Express API sebagai serverless functions, TAPI dengan limitasi:
- Max 10 seconds per request
- Stateless (tidak bisa simpan file lokal)
- Function isolation

**Setup Vercel untuk Backend:**

1. Buat `vercel.json` di root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/app.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "frontend/dist" }
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/backend/app.js" },
    { "src": "/(.*)", "dest": "/frontend/dist/$1" },
    { "src": "/(.*)", "dest": "/frontend/dist/index.html" }
  ]
}
```

2. Install Vercel dependencies:
```bash
npm install -D @vercel/node
```

3. Update `backend/app.js` untuk Vercel serverless:
```javascript
// Vercel serverless functions
module.exports = app; // Export express app
```

**TAPI MASALAH:**
- ❌ SQLite tidak bisa persistent (file hilang setiap deploy)
- ❌ Butuh PostgreSQL untuk persistence
- ❌ 10 detik timeout per request (bisa kurang untuk heavy queries)
- ✅ Neo4j OK (cloud-based)

---

### **OPSI 2: Backend di Platform Lain (Better)**

Pisahkan frontend dan backend:

#### **Frontend: Vercel** ✅
```
https://kbs-sleep-disorder.vercel.app
```

#### **Backend: Pilih Salah Satu:**

**A. Railway.app** (Recommended)
- Free tier: $5/month credit
- Support Node.js + database
- Easy deployment dari GitHub
- URL: `https://your-app-backend-prod.railway.app`

**B. Render.com**
- Free tier: Limited
- Support Node.js + database
- Auto-deploy dari GitHub
- URL: `https://your-app-backend.onrender.com`

**C. Fly.io**
- Support Docker
- Pay-as-you-go
- Global distribution
- URL: `https://your-app-backend.fly.dev`

**D. AWS EC2** (Advanced)
- Full control
- More expensive
- Requires DevOps knowledge

---

## Recommended Setup untuk KBS:

### **Frontend + Backend Separation:**

```
┌─────────────────────────────────────────┐
│         Frontend (Vercel)               │
│    https://kbs-sleep-disorder.app       │
│         (React + Vite)                  │
└──────────────┬──────────────────────────┘
               │ API calls to
               ↓
┌──────────────────────────────────────────┐
│    Backend (Railway/Render)              │
│   https://kbs-backend.railway.app        │
│      (Express + Neo4j)                   │
└──────────────────────────────────────────┘
               │
               ↓
         ┌──────────────┐
         │ Neo4j Aura   │
         │  (Cloud)     │
         └──────────────┘
```

---

## OPSI 2A: Deploy Backend ke Railway.app

### Step 1: Buat Akun Railway
- Buka: https://railway.app
- Sign in dengan GitHub

### Step 2: Create New Project
- Click "New Project"
- Click "Deploy from GitHub repo"
- Pilih repository `KBS-Sleep-Disorder`

### Step 3: Configure
- Click "Configure Service"
- Set `RAILWAY_VOLUME_MOUNT_PATH=/app/data` (untuk SQLite persistence)
- Set root path ke `backend`

### Step 4: Add Environment Variables
Di Project → Variables, tambahkan:

```env
PORT=5000
NODE_ENV=production

# Neo4j
NEO4J_URI=neo4j+s://1ddeb3bf.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=BoX-qrO5bDDHAb5OwY45GsRfVSb_Sz1OfvGqNVnzLi4
NEO4J_DATABASE=neo4j

# JWT
JWT_SECRET=(generate random)

# SQLite
SQLITE_PATH=/app/data/auth.db

# CORS
CORS_ORIGIN=https://kbs-sleep-disorder.vercel.app
FRONTEND_URL=https://kbs-sleep-disorder.vercel.app

# Feature Flags
ALLOW_OFFLINE=true
DEMO_MODE=false
```

### Step 5: Deploy
- Railway auto-deploys dari GitHub
- Check logs di Railway dashboard
- Copy URL dari Railway: `https://your-backend-prod.railway.app`

### Step 6: Update Frontend .env di Vercel

Di Vercel → Project Settings → Environment Variables:

```env
VITE_API_URL=https://your-backend-prod.railway.app/api
VITE_API_BASE_URL=https://your-backend-prod.railway.app
```

Redeploy frontend.

---

## OPSI 2B: Deploy Backend ke Render.com

### Step 1: Buat Akun
- Buka: https://render.com
- Sign up dengan GitHub

### Step 2: Create New Web Service
- Click "New" → "Web Service"
- Connect GitHub repository
- Select `KBS-Sleep-Disorder`

### Step 3: Configure
- **Name:** kbs-sleep-disorder-api
- **Root Directory:** backend
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** Free tier OK

### Step 4: Add Environment Variables
Sama seperti Railway (lihat di atas)

### Step 5: Deploy
- Click "Create Web Service"
- Render otomatis deploy
- Copy URL: `https://kbs-sleep-disorder-api.onrender.com`

### Step 6: Update Frontend .env
Sama seperti Railway

---

## QUICK COMPARISON:

| Platform | Cost | Setup | Persistence | Recommendation |
|----------|------|-------|-------------|---|
| **Vercel** | Free | Easy | ❌ SQLite risky | Frontend only |
| **Railway** | $5/mo | Easy | ✅ Good | **BEST** |
| **Render** | Free* | Easy | ⚠️ Limited | Good |
| **Fly.io** | Pay/use | Medium | ✅ Good | Advanced |
| **AWS EC2** | Varies | Hard | ✅ Full | Enterprise |

*Render free tier auto-sleep = API down

---

## RECOMMENDED FINAL SETUP:

### **Frontend:**
```
Platform: Vercel
URL: https://kbs-sleep-disorder.vercel.app
```

### **Backend:**
```
Platform: Railway.app
URL: https://kbs-sleep-disorder-api.railway.app
Cost: ~$5/month credit (usually free tier enough)
```

### **Database:**
```
Neo4j Aura: neo4j+s://1ddeb3bf.databases.neo4j.io
SQLite: Stored on Railway volume
```

---

## Implementation Steps (Recommended):

### 1. Push Current Code to GitHub ✅
```bash
git push origin main
```

### 2. Deploy Frontend to Vercel ✅
- Follow VERCEL_SETUP.md
- Domain: https://kbs-sleep-disorder.vercel.app

### 3. Deploy Backend to Railway
- Create Railway account
- Connect GitHub repository
- Set environment variables
- Domain: https://kbs-sleep-disorder-api.railway.app

### 4. Update Frontend .env Variables
```env
VITE_API_URL=https://kbs-sleep-disorder-api.railway.app/api
VITE_API_BASE_URL=https://kbs-sleep-disorder-api.railway.app
```

### 5. Redeploy Frontend to Vercel
- Vercel auto-redeploys on push
- Or manually trigger deployment

### 6. Test
```bash
# Frontend
curl https://kbs-sleep-disorder.vercel.app

# Backend
curl https://kbs-sleep-disorder-api.railway.app/api/health
```

---

## Do You Want:

1. **Backend di Vercel (Serverless)** → Beri tahu, saya setup
2. **Backend di Railway.app** → Saya kasih detailed guide
3. **Backend di Platform Lain** → Saya bantu pilih & setup
4. **Local Backend + Vercel Frontend** → Gunakan `npm run dev` lokal

Mana yang diinginkan? 🚀
