# Complete Environment Variables Setup
## Railway Backend + Vercel Frontend

---

## 📋 FILE GUIDE

```
.env.railway   → Copy-paste ke Railway Dashboard
.env.vercel    → Copy-paste ke Vercel Dashboard
.env           → Local development (tidak commit)
.env.example   → Template untuk dokumentasi
```

---

## 🚀 RAILWAY BACKEND SETUP

### File: `.env.railway`

Copy-paste **SEMUA** isi file ini ke Railway Dashboard:

```env
# ================================================
# Railway Backend - Environment Variables
# ================================================

# ========== SERVER CONFIGURATION ==========
PORT=5000
NODE_ENV=production
APP_URL=https://your-project-backend.railway.app

# ========== JWT AUTHENTICATION ==========
JWT_SECRET=ba0c5e7b2e4d4c6da9a1efc5a0cf0d523c4d8a0b7d27e1b2a4f8c9d61e0b2f3c
JWT_EXPIRES_IN=7d

# ========== DATABASE - SQLite (LOCAL) ==========
SQLITE_PATH=/app/data/auth.db

# ========== NEO4J AURA (GRAPH DATABASE) ==========
NEO4J_URI=neo4j+s://1ddeb3bf.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=BoX-qrO5bDDHAb5OwY45GsRfVSb_Sz1OfvGqNVnzLi4
NEO4J_DATABASE=neo4j

# ========== AURA INSTANCE INFO ==========
AURA_INSTANCEID=1ddeb3bf
AURA_INSTANCENAME=SleepDisorder

# ========== CORS & SECURITY ==========
FRONTEND_URL=https://kbs-sleep-disorder.vercel.app
CORS_ORIGIN=https://kbs-sleep-disorder.vercel.app

# ========== LOGGING ==========
LOG_LEVEL=info
MORGAN_FORMAT=combined

# ========== SECURITY ==========
BCRYPT_ROUNDS=10

# ========== FILE UPLOAD ==========
MAX_FILE_SIZE=5242880
UPLOAD_DIR=/app/uploads

# ========== FEATURE FLAGS ==========
ALLOW_OFFLINE=true
DEMO_MODE=false
```

### Steps di Railway:

1. **Buka:** https://railway.app
2. **Dashboard** → Your Project
3. **Variables** tab
4. Click **Add Variable**
5. Copy-paste setiap variable dari `.env.railway`

**ATAU** jika Railway support `.env` file upload:
- Upload file `.env.railway` langsung ke Railway

---

## 🌐 VERCEL FRONTEND SETUP

### File: `.env.vercel`

Copy-paste **SEMUA** isi file ini ke Vercel Dashboard:

```env
# ================================================
# Vercel Frontend - Environment Variables
# ================================================

# ========== API CONFIGURATION ==========
# GANTI dengan Railway URL actual
VITE_API_URL=https://your-project-backend.railway.app/api
VITE_API_BASE_URL=https://your-project-backend.railway.app

# ========== APP INFORMATION ==========
VITE_APP_NAME=Sleep Health KBS
VITE_APP_VERSION=1.0.0

# ========== THEME CONFIGURATION ==========
VITE_THEME_MODE=auto

# ========== DEBUG ==========
VITE_DEBUG=false
```

### Steps di Vercel:

1. **Buka:** https://vercel.com/dashboard
2. **Select Project** → kbs-sleep-disorder
3. **Settings** → **Environment Variables**
4. Click **Add New**
5. Copy-paste setiap variable dari `.env.vercel`

---

## 🔗 IMPORTANT URLS

Setelah setup, ganti placeholder dengan actual URLs:

### After Railway Deploy:
Railway akan kasih URL seperti:
```
https://kbs-sleep-disorder-api-prod.railway.app
```

Ganti di:
- `.env.railway`: `APP_URL=https://kbs-sleep-disorder-api-prod.railway.app`
- `.env.vercel`: 
  ```
  VITE_API_URL=https://kbs-sleep-disorder-api-prod.railway.app/api
  VITE_API_BASE_URL=https://kbs-sleep-disorder-api-prod.railway.app
  ```

### After Vercel Deploy:
Vercel akan kasih URL seperti:
```
https://kbs-sleep-disorder.vercel.app
```

Ganti di `.env.railway`:
```
FRONTEND_URL=https://kbs-sleep-disorder.vercel.app
CORS_ORIGIN=https://kbs-sleep-disorder.vercel.app
```

---

## 📝 SETUP CHECKLIST

### Railway Backend Setup:
- [ ] Create Railway account
- [ ] Import GitHub repository
- [ ] Set root directory to `backend`
- [ ] Add all variables dari `.env.railway`
- [ ] Deploy
- [ ] Copy Railway URL
- [ ] Test: `curl https://[railway-url]/api/health`

### Vercel Frontend Setup:
- [ ] Create Vercel account (or login)
- [ ] Import GitHub repository
- [ ] Set root directory to `frontend`
- [ ] Add all variables dari `.env.vercel`
- [ ] **IMPORTANT:** Update `VITE_API_URL` with Railway URL
- [ ] Deploy
- [ ] Copy Vercel URL
- [ ] Test: `curl https://[vercel-url]`

### Final Update:
- [ ] Update Railway's `FRONTEND_URL` with Vercel URL
- [ ] Redeploy Railway
- [ ] Test API from frontend

---

## ✅ VERIFY DEPLOYMENT

### Test Frontend:
```bash
curl https://kbs-sleep-disorder.vercel.app
# Should return HTML page
```

### Test Backend Health:
```bash
curl https://[railway-url]/api/health
# Should return JSON with status
```

### Test API Connection:
```bash
curl https://[railway-url]/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

### Test from Frontend:
- Go to https://kbs-sleep-disorder.vercel.app
- Try login or screening
- Check browser console for any errors

---

## 🔐 SECURITY NOTES

⚠️ **NEVER commit actual `.env` files!**

- ✅ Keep `.env*` files in `.gitignore` (sudah ada)
- ✅ Only commit `.env.example` untuk dokumentasi
- ✅ Set sensitive values via platform dashboard
- ✅ Rotate `JWT_SECRET` di production
- ✅ Use different secrets untuk dev, staging, production

---

## 🆘 TROUBLESHOOTING

### Railway Deployment Fails:
- Check build logs in Railway dashboard
- Ensure `backend/package.json` exists
- Verify Node version compatibility
- Check for missing environment variables

### Frontend Can't Connect to Backend:
- Verify `VITE_API_URL` is correct
- Check CORS settings in Railway
- Ensure `FRONTEND_URL` in Railway matches Vercel URL
- Check browser console for actual error

### API Health Check Fails:
- Check Neo4j connection is working
- Verify NEO4J_* variables are correct
- Wait 60 seconds if Aura just created
- Check Railway logs for errors

### CORS Error:
- Update Railway's `CORS_ORIGIN` with correct Vercel URL
- Ensure no typos in URLs (https://, not http://)
- Redeploy Railway after changing CORS

---

## 📚 REFERENCE

### Variable Meanings:

| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Server port | `5000` |
| `JWT_SECRET` | Token signing key | Generate with `openssl rand -base64 32` |
| `NEO4J_URI` | Graph database URL | Provided by Neo4j Aura |
| `VITE_API_URL` | Frontend API endpoint | `https://backend.railway.app/api` |
| `SQLITE_PATH` | SQLite database location | `/app/data/auth.db` |
| `CORS_ORIGIN` | Allowed frontend URL | `https://frontend.vercel.app` |

---

## 🚀 DEPLOYMENT ORDER

1. **Deploy Backend (Railway) FIRST**
   - Get Railway URL
   
2. **Deploy Frontend (Vercel) SECOND**
   - Add Railway URL to environment variables
   
3. **Update Backend CORS**
   - Add Vercel URL to Railway FRONTEND_URL
   - Redeploy Railway

4. **Test Everything**
   - Frontend loads
   - API responds
   - Login works
   - Screening works

---

## 💡 TIPS

- **Save Railway & Vercel URLs** somewhere safe
- **Test API** immediately after deploy
- **Monitor logs** for any errors
- **Keep `.env.railway` and `.env.vercel` files** for future updates
- **Document any custom changes** you make

---

File siap! Tinggal copy-paste ke masing-masing platform. 🎉
