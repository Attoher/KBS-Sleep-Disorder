# Deployment Guide - Vercel

## Deployment Setup untuk Sleep Health KBS

### Prerequisites
- GitHub account dengan repository terhubung
- Vercel account (free tier available at https://vercel.com)
- Neo4j Aura instance sudah siap (credentials sudah disediakan)

### Step 1: Prepare Repository

```bash
# Pastikan .gitignore sudah ada dan tidak include:
# - node_modules/
# - .env (secrets)
# - *.log
# - dist/
# - build/

# Commit semua perubahan
git add .
git commit -m "chore: prepare for Vercel deployment"
git push origin main
```

### Step 2: Connect Repository ke Vercel

1. Buka https://vercel.com/new
2. Pilih "Import Git Repository"
3. Pilih GitHub repository `KBS-Sleep-Disorder`
4. Klik "Import"

### Step 3: Configure Build Settings

Dalam Vercel Import dialog, gunakan settings berikut:

**Project Name:**
```
kbs-sleep-disorder
```

**Framework Preset:**
```
Vite
```

**Root Directory:**
```
frontend
```

**Build Command:**
```
npm run build
```

**Output Directory:**
```
dist
```

### Step 4: Set Environment Variables

Di Vercel Project Settings > Environment Variables, tambahkan:

```
# Frontend Variables
VITE_API_URL = https://your-project.vercel.app/api
VITE_API_BASE_URL = https://your-project.vercel.app

# Backend Variables
PORT = 5000
JWT_SECRET = (generate secure key min 32 chars)

# Neo4j Aura Configuration
NEO4J_URI = neo4j+s://1ddeb3bf.databases.neo4j.io
NEO4J_USERNAME = neo4j
NEO4J_PASSWORD = BoX-qrO5bDDHAb5OwY45GsRfVSb_Sz1OfvGqNVnzLi4
NEO4J_DATABASE = neo4j
AURA_INSTANCEID = 1ddeb3bf
AURA_INSTANCENAME = SleepDisorder

# CORS Configuration
FRONTEND_URL = https://your-project.vercel.app
```

### Step 5: Database Setup

**Option A: PostgreSQL (Recommended for Production)**

1. Gunakan Vercel Postgres atau managed service lain
2. Dapatkan connection string
3. Konfigurasi di environment variables:
   ```
   DB_HOST = your-postgres-host
   DB_PORT = 5432
   DB_NAME = sleep_health_db
   DB_USER = your-db-user
   DB_PASSWORD = your-db-password
   ```

**Option B: SQLite (Demo/Testing)**

1. Enable `ALLOW_OFFLINE=true` untuk fallback mode
2. Database akan menggunakan SQLite lokal

### Step 6: API Routes Configuration

Backend API routes sudah dikonfigurasi di `vercel.json`:

```
/api/* -> backend/app.js
```

Setelah deployment, backend accessible di:
```
https://your-project.vercel.app/api
```

### Step 7: Deploy

1. Klik "Deploy" di Vercel
2. Tunggu build process selesai (5-10 menit)
3. Vercel akan memberikan production URL

### Step 8: Test Deployment

```bash
# Test frontend
curl https://your-project.vercel.app

# Test API health
curl https://your-project.vercel.app/api/health

# Test authentication endpoint
curl -X POST https://your-project.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## Environment Variables Checklist

Pastikan semua variables sudah diset:

**Production:**
- ✅ `VITE_API_URL` = Production API URL
- ✅ `VITE_API_BASE_URL` = Production API Base
- ✅ `NEO4J_URI` = Aura instance URI
- ✅ `NEO4J_USERNAME` = neo4j
- ✅ `NEO4J_PASSWORD` = Your password
- ✅ `JWT_SECRET` = Secure random string (min 32 chars)
- ✅ `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- ✅ `FRONTEND_URL` = Production domain

**Optional:**
- `DEMO_MODE` = false (use databases)
- `ALLOW_OFFLINE` = false (require databases)

## Deployment Monitoring

### Vercel Dashboard
- View deployment logs: https://vercel.com/dashboard
- Monitor performance and errors
- Check environment variables

### Health Check Endpoints

```bash
# Backend health
curl https://your-project.vercel.app/api/health

# Expected response:
{
  "status": "ok",
  "services": {
    "postgres": "ok",
    "neo4j": "ok"
  },
  "uptime": 123456,
  "mode": "production"
}
```

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies in `package.json`
- Verify environment variables are set

### API Returns 500 Errors
- Check server logs in Vercel
- Verify Neo4j connection with provided credentials
- Check JWT_SECRET is set and strong enough

### CORS Errors
- Update `FRONTEND_URL` in environment variables
- Ensure CORS middleware in Express is configured correctly

### Database Connection Fails
- For Neo4j: Ensure Aura instance is running (wait 60 seconds after creation)
- For PostgreSQL: Verify connection string and credentials
- For fallback: Enable `ALLOW_OFFLINE=true`

## Rollback

Jika ada issue, rollback deployment di Vercel dashboard:
1. Go to Deployments
2. Find previous successful deployment
3. Click "Redeploy"

## Production Checklist

Before going live:
- [ ] All environment variables set correctly
- [ ] Database connections tested
- [ ] Neo4j Aura instance running
- [ ] API health check passing
- [ ] Frontend loads without errors
- [ ] Authentication flow working
- [ ] Screening functionality tested
- [ ] Analytics dashboard accessible
- [ ] Error handling in place
- [ ] Logging configured

## Next Steps

1. Deploy to Vercel
2. Set up custom domain (optional)
3. Configure analytics tracking
4. Set up monitoring/alerts
5. Plan backup strategy for databases

## Support

For deployment issues:
- Check Vercel docs: https://vercel.com/docs
- Check Express deployment guide: https://expressjs.com/en/advanced/best-practice-performance.html
- Neo4j Aura support: https://console.neo4j.io
