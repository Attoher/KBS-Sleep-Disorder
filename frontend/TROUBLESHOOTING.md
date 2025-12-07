# 🔧 TROUBLESHOOTING - Frontend Issues

## ✅ FIXED: Blank White Page Issue

### Problem
Saat membuka `http://localhost:3000`, halaman muncul putih kosong meskipun title sudah muncul.

### Root Cause
1. **Default route** redirect ke `/dashboard` (yang memerlukan login)
2. **AuthContext** tidak menampilkan loading screen saat checking authentication
3. Backend belum running, sehingga `fetchUser()` gagal dan stuck di loading state

### Solution Applied ✅

#### 1. Added Loading Screen in AuthContext
**File**: `src/contexts/AuthContext.jsx`

```jsx
// Import Loader component
import Loader from '../components/Common/Loader';

// Add loading UI before returning children
if (loading) {
  return (
    <AuthContext.Provider value={value}>
      <Loader fullScreen />
    </AuthContext.Provider>
  );
}
```

#### 2. Changed Default Routes
**File**: `src/App.jsx`

```jsx
// Before:
<Route path="/" element={<Navigate to="/dashboard" />} />
<Route path="*" element={<Navigate to="/dashboard" />} />

// After:
<Route path="/" element={<Navigate to="/login" replace />} />
<Route path="*" element={<Navigate to="/login" replace />} />
```

#### 3. Added Loader Animation CSS
**File**: `src/index.css`

```css
@keyframes spin-delayed {
  to {
    transform: rotate(360deg);
  }
}

.animation-delay-300 {
  animation: spin-delayed 1s linear infinite;
  animation-delay: 0.3s;
}
```

### How to Test

1. **Stop old server** (if running):
   ```powershell
   Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
   ```

2. **Start fresh server**:
   ```powershell
   cd frontend
   npm run dev
   ```

3. **Open browser**:
   ```
   http://localhost:3000
   ```

4. **Expected Result**:
   - ✅ You should see **LOGIN PAGE** immediately
   - ✅ No more blank white screen
   - ✅ If backend not running, error will show in toast notification

---

## 🐛 Common Frontend Issues & Solutions

### Issue 1: Port 3000 Already in Use

**Symptoms**:
```
Port 3000 is in use, trying another one...
Local: http://localhost:3001/
```

**Solution**:
```powershell
# Option 1: Kill process on port 3000
$processId = (Get-NetTCPConnection -LocalPort 3000).OwningProcess
Stop-Process -Id $processId -Force

# Option 2: Kill all Node processes
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force

# Then restart
npm run dev
```

---

### Issue 2: Backend Connection Error

**Symptoms**:
- Toast notification: "Failed to fetch user"
- Console error: `ERR_CONNECTION_REFUSED`

**Solution**:
```powershell
# Start backend first
cd backend
npm run dev

# OR use Docker
docker-compose up backend postgres neo4j
```

**Alternative**: Allow guest mode by modifying API calls to handle errors gracefully.

---

### Issue 3: Infinite Loading Screen

**Symptoms**:
- Loader spins forever
- Page doesn't proceed

**Causes & Solutions**:

1. **Backend not responding**:
   ```powershell
   # Check backend
   Invoke-WebRequest http://localhost:5000/health
   ```

2. **Token expired/invalid**:
   ```javascript
   // Clear localStorage in browser console
   localStorage.clear()
   // Then refresh page
   ```

3. **AuthContext stuck**:
   - Check browser console for errors
   - Verify `fetchUser()` is completing

---

### Issue 4: Routes Not Working (404)

**Symptoms**:
- Direct URL access shows 404
- Page not found after refresh

**Solution for Development**:
Vite dev server should handle this automatically. If not:

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Add this if needed:
    historyApiFallback: true
  }
})
```

**Solution for Production (nginx)**:
Already configured in `nginx.conf`:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

### Issue 5: Styles Not Loading

**Symptoms**:
- Plain HTML without styling
- Tailwind classes not applied

**Solutions**:

1. **Check Tailwind config**:
   ```javascript
   // tailwind.config.js
   content: [
     "./index.html",
     "./src/**/*.{js,jsx}"
   ]
   ```

2. **Verify imports**:
   ```jsx
   // src/main.jsx
   import './index.css'
   ```

3. **Rebuild**:
   ```powershell
   Remove-Item -Recurse -Force node_modules, dist
   npm install
   npm run dev
   ```

---

### Issue 6: Components Not Rendering

**Symptoms**:
- Blank sections
- Missing components

**Common Causes**:

1. **Import errors**:
   ```jsx
   // Check file paths and exports
   import Component from './Component' // ❌ Wrong
   import Component from './Component.jsx' // ✅ Correct
   ```

2. **Async data not loading**:
   ```jsx
   // Add loading states
   if (loading) return <Loader />
   if (error) return <div>Error: {error}</div>
   ```

3. **Conditional rendering issues**:
   ```jsx
   // Be explicit with conditions
   {data && data.length > 0 && (
     <div>...</div>
   )}
   ```

---

### Issue 7: Hot Module Replacement Not Working

**Symptoms**:
- Changes not reflecting
- Need manual refresh

**Solutions**:

1. **Restart Vite**:
   ```powershell
   # Stop with Ctrl+C, then
   npm run dev
   ```

2. **Check file paths**:
   - Use relative imports
   - Avoid absolute paths in Vite config

3. **Clear cache**:
   ```powershell
   Remove-Item -Recurse -Force .vite, dist
   npm run dev
   ```

---

### Issue 8: API Calls Failing

**Symptoms**:
- 401 Unauthorized
- Network errors
- CORS errors

**Solutions**:

1. **Check API URL**:
   ```env
   # .env
   VITE_API_URL=http://localhost:5000/api
   ```

2. **Verify backend CORS**:
   ```javascript
   // backend/app.js
   cors({
     origin: 'http://localhost:3000',
     credentials: true
   })
   ```

3. **Check token**:
   ```javascript
   // Browser console
   localStorage.getItem('token')
   ```

4. **Axios interceptor**:
   ```javascript
   // src/utils/api.js
   // Verify Authorization header is added
   ```

---

### Issue 9: Build Fails

**Symptoms**:
```
npm run build
❌ Error: ...
```

**Solutions**:

1. **Check for syntax errors**:
   ```powershell
   npm run lint
   ```

2. **Clear cache and rebuild**:
   ```powershell
   Remove-Item -Recurse -Force node_modules, dist, .vite
   npm install
   npm run build
   ```

3. **Check dependencies**:
   ```powershell
   npm audit
   npm audit fix
   ```

---

### Issue 10: Docker Container Shows Blank Page

**Symptoms**:
- Docker container running
- Browser shows blank page
- No console errors

**Solutions**:

1. **Check nginx logs**:
   ```powershell
   docker logs frontend
   ```

2. **Verify nginx config**:
   ```nginx
   # nginx.conf should have:
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```

3. **Check environment variables**:
   ```dockerfile
   # Rebuild with correct env
   docker build --build-arg VITE_API_URL=http://backend:5000/api .
   ```

4. **Test build locally first**:
   ```powershell
   npm run build
   npm run preview
   # If this works, Docker should too
   ```

---

## 🔍 Debugging Commands

### Check What's Running
```powershell
# Check ports
Get-NetTCPConnection -LocalPort 3000,5000,7474,5432

# Check processes
Get-Process | Where-Object {$_.ProcessName -match "node|docker"}
```

### Check Services
```powershell
# Frontend
Invoke-WebRequest http://localhost:3000

# Backend
Invoke-WebRequest http://localhost:5000/health

# Neo4j
Invoke-WebRequest http://localhost:7474
```

### Clear Everything
```powershell
# Frontend
cd frontend
Remove-Item -Recurse -Force node_modules, dist, .vite
npm install

# Stop all
docker-compose down
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
```

---

## 📊 Health Check Script

Run automatic diagnostics:
```powershell
cd frontend
.\health-check.ps1
```

This checks:
- ✅ Dependencies
- ✅ Environment variables
- ✅ Backend connectivity
- ✅ Build process
- ✅ Linting
- ✅ Docker config

---

## 🆘 Still Having Issues?

1. **Check browser console** (F12 → Console tab)
   - Look for error messages
   - Check Network tab for failed requests

2. **Check Vite output**
   - Terminal where `npm run dev` is running
   - Look for compilation errors

3. **Verify file structure**
   ```powershell
   Get-ChildItem src -Recurse | Select-Object FullName
   ```

4. **Test minimal setup**:
   ```jsx
   // Temporarily replace App.jsx content
   function App() {
     return <div>Hello World</div>
   }
   export default App;
   ```

5. **Check system requirements**:
   - Node.js 18+ installed
   - npm 9+ installed
   - No antivirus blocking ports

---

## 📝 Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| Blank page | Check default route, add loading screen |
| Port conflict | Kill Node processes, restart |
| Backend error | Start backend first |
| Infinite load | Clear localStorage, check backend |
| Styles missing | Rebuild, check Tailwind config |
| HMR broken | Restart Vite server |
| Build fails | Clear cache, reinstall deps |

---

**Last Updated**: December 7, 2025
**Status**: ✅ All major issues resolved
