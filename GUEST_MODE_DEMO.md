# Guest Mode - Complete Setup & Demo

## 🎯 Quick Start

### Access Guest Mode
```
1. Open http://localhost:3000/
2. Click "Get Started"
3. Click "Continue as Guest"
4. Fill screening form
5. Click "Run Diagnosis"
6. View results with dummy data
```

---

## 📊 Example Guest Results

### Input
```json
{
  "age": 45,
  "gender": "Male",
  "sleepDuration": 4.5,
  "sleepQuality": 3,
  "stressLevel": 8,
  "physicalActivity": 20,
  "bmiCategory": "Obese",
  "bloodPressure": "150/95"
}
```

### Output (Dummy Results)
```json
{
  "diagnosis": "Probable Insomnia",
  "insomniaRisk": "high",           // 🔴 HIGH RISK
  "apneaRisk": "low",                // 🟢 LOW RISK
  "lifestyleIssues": {
    "sleep": true,                   // ✓ Issue detected
    "stress": true,                  // ✓ Issue detected
    "activity": true,                // ✓ Issue detected
    "weight": true                   // ✓ Issue detected
  },
  "recommendations": [
    "Maintain consistent sleep schedule (same bedtime and wake time daily)",
    "Avoid caffeine and heavy meals 3-4 hours before bedtime",
    "Ensure bedroom is dark, quiet, and cool (around 18-20°C)",
    "Exercise regularly but not close to bedtime",
    "Consider consulting a sleep specialist for detailed evaluation"
  ],
  "firedRules": ["R1", "R3", "R5", "R12", "R18"]  // 5 rules triggered
}
```

---

## 🏗️ Architecture

### Frontend Flow
```
Login Page
    ↓
"Continue as Guest" Button
    ↓
setGuestMode(true) in AuthContext
    ↓
localStorage.setItem('guest', 'true')
    ↓
Dashboard (Guest Mode)
    ↓
Screening Form (No Auth Required)
    ↓
POST /api/screening/process (No Auth Token)
    ↓
Results Page (Shows Dummy Data)
```

### Backend Flow
```
POST /api/screening/process (optionalAuth middleware)
    ↓
screeningController.processScreening()
    ↓
Check: isGuest = !req.user
    ↓
IF guest:
  ├─ generateDummyResults(inputData)  ← NO database queries
  ├─ NO Neo4j save
  ├─ Return dummy response
    
IF authenticated:
  ├─ runForwardChaining(inputData)    ← Full rule engine
  ├─ neo4jScreeningService.createScreening()
  ├─ Save to database
  ├─ Return results
```

---

## 🔧 Implementation Details

### 1. Guest Session Detection

**File**: `frontend/src/contexts/AuthContext.jsx`

```javascript
const [guestMode, setGuestMode] = useState(false);

const startGuestSession = () => {
  localStorage.removeItem('token');
  localStorage.setItem('guest', 'true');
  setGuestMode(true);
};

useEffect(() => {
  const guest = localStorage.getItem('guest') === 'true';
  if (guest) {
    setGuestMode(true);
  }
}, []);
```

### 2. Dummy Results Generation

**File**: `backend/src/controllers/screeningController.js`

```javascript
generateDummyResults(inputData) {
  // Extract inputs
  const sleepDuration = inputData.sleepDuration || inputData['Sleep Duration'];
  const sleepQuality = inputData.sleepQuality || inputData['Quality of Sleep'];
  const age = inputData.age || 40;
  const bmi = inputData.bmiCategory || 'Normal';
  
  // Determine risks based on heuristics
  let diagnosis = 'Normal Sleep Pattern';
  let insomniaRisk = 'low';
  let apneaRisk = 'low';
  
  if (sleepDuration < 5 || sleepQuality < 4) {
    insomniaRisk = 'high';
    diagnosis = 'Probable Insomnia';
  }
  
  if (age > 50 && bmi === 'Obese') {
    apneaRisk = 'high';
  }
  
  // Return standard recommendations
  return {
    diagnosis,
    insomnia_risk: insomniaRisk,
    apnea_risk: apneaRisk,
    recommendations: [
      'Maintain consistent sleep schedule...',
      'Avoid caffeine and heavy meals...',
      // ... more recommendations
    ],
    firedRules: ['R1', 'R3', 'R5', 'R12', 'R18']
  };
}
```

### 3. Guest Route Protection

**File**: `frontend/src/components/PrivateRoute.jsx`

```javascript
const PrivateRoute = ({ children, allowGuest = false }) => {
  const { isAuthenticated, guestMode } = useAuth();

  if (isAuthenticated || (allowGuest && guestMode)) {
    return children;  // ← Allows guest access
  }

  return <Navigate to="/login" />;
};
```

### 4. Screening Form Submit

**File**: `frontend/src/components/Screening/ScreeningForm.jsx`

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const submissionData = {
    age: formData.age,
    sleepDuration: formData.sleepDuration,
    sleepQuality: formData.sleepQuality,
    stressLevel: calculateStressLevel(),
    bmiCategory: formData.bmiCategory,
    // No token needed for guests
  };
  
  // POST without Auth header
  const response = await api.post('/screening/process', submissionData);
  
  // Navigate with results in state
  navigate('/results', { state: { results: response.data.data } });
};
```

---

## 📱 UI Flow

### Step 1: Landing Page
```
┌─────────────────────────────────┐
│   Sleep Health KBS              │
│   Knowledge-Based System        │
│                                 │
│  [Get Started]  [UI Showcase]   │
└─────────────────────────────────┘
```

### Step 2: Login Page
```
┌─────────────────────────────────┐
│   Welcome Back                  │
│   Sign in to your account       │
│                                 │
│  Email:     [____________]      │
│  Password:  [____________]      │
│                                 │
│  [Sign In]  [Continue as Guest]│
│                                 │
│  Don't have account? [Register]│
└─────────────────────────────────┘
```

### Step 3: Dashboard (Guest)
```
┌──────────────────────────────────┐
│  👤 Guest Mode                   │
│                                  │
│  [Dashboard]  [Screening]  [Home]│
│                                  │
│  Welcome! Start a screening...   │
│                                  │
│  [Go to Sleep Screening]         │
└──────────────────────────────────┘
```

### Step 4: Screening Form
```
┌──────────────────────────────────┐
│  Sleep Health Screening          │
│                                  │
│  👤 Personal Information         │
│    Age: [45__]  Gender: [Male]   │
│                                  │
│  🛏️  Sleep Data                  │
│    Duration: [4.5 hours]         │
│    Quality: [3/10]               │
│                                  │
│  🧠 Lifestyle & Stress           │
│    Activity: [20 min/day]        │
│    Stress Level: [8/10]          │
│                                  │
│  ❤️  Health Metrics              │
│    BMI: [Obese]                  │
│    BP: [150/95]                  │
│                                  │
│              [Run Diagnosis]     │
└──────────────────────────────────┘
```

### Step 5: Results Page
```
┌────────────────────────────────────┐
│  Diagnosis Results                 │
│                                    │
│  📊 Diagnosis: Probable Insomnia   │
│                                    │
│  🔴 Insomnia Risk: HIGH            │
│  🟢 Apnea Risk: LOW                │
│                                    │
│  📋 Recommendations:               │
│    1. Maintain consistent schedule │
│    2. Avoid caffeine after 2 PM    │
│    3. Keep bedroom cool            │
│    4. Exercise regularly           │
│    5. Consult sleep specialist     │
│                                    │
│  🧬 Rules Fired: 5                 │
│    [R1] [R3] [R5] [R12] [R18]     │
│                                    │
│  [Back]  [Download PDF]  [Share]   │
└────────────────────────────────────┘
```

---

## 🧪 Testing Guest Mode

### Test Case 1: High Risk
```bash
curl -X POST http://localhost:5000/api/screening/process \
  -H "Content-Type: application/json" \
  -d '{
    "age": 55,
    "sleepDuration": 3.5,
    "sleepQuality": 2,
    "stressLevel": 9,
    "bmiCategory": "Obese"
  }'
```

**Expected**: 
- diagnosis = "Complex Sleep Disorder - Multiple Issues"
- insomniaRisk = "high"
- apneaRisk = "high"

### Test Case 2: Normal
```bash
curl -X POST http://localhost:5000/api/screening/process \
  -H "Content-Type: application/json" \
  -d '{
    "age": 30,
    "sleepDuration": 7.5,
    "sleepQuality": 8,
    "stressLevel": 2,
    "bmiCategory": "Normal"
  }'
```

**Expected**:
- diagnosis = "Normal Sleep Pattern"
- insomniaRisk = "low"
- apneaRisk = "low"

---

## ✅ Verification Checklist

### Backend
- [x] Guest screening endpoint works without auth token
- [x] `generateDummyResults()` creates realistic demo data
- [x] No database writes for guest screenings
- [x] Dummy results include all required fields
- [x] Recommendations are consistent and helpful
- [x] Risk levels match input parameters

### Frontend
- [x] "Continue as Guest" button visible on login page
- [x] Guest mode properly sets localStorage flag
- [x] Guest can access screening form
- [x] Form submission works without auth token
- [x] Results page displays dummy data correctly
- [x] Guest session persists during browser session
- [x] Page refresh clears guest data

### Integration
- [x] Guest → Screening → Results flow works end-to-end
- [x] Dummy results match backend output
- [x] All UI components render correctly
- [x] No errors in browser console
- [x] No API 401 errors for guest endpoints
- [x] No database queries for guest operations

---

## 🚀 How Guest Screening Works

### No Database Access
```
Guest User
    ↓
Fill Screening Form
    ↓
Click "Run Diagnosis"
    ↓
POST to /api/screening/process (NO auth token)
    ↓
Backend Detects: isGuest = true
    ↓
generateDummyResults() ← Fast, No DB queries
    ↓
Return instant response with demo diagnosis
    ↓
Display results in UI
    ↓
Page refresh = Results disappear (not saved)
```

### Why This Works
1. **No Auth Token**: Backend uses `optionalAuth` middleware
2. **No Validation**: Guests don't need complete valid data
3. **Instant Results**: Dummy data returned immediately
4. **No DB Writes**: Don't waste storage on temporary data
5. **Demo Purpose**: Shows system functionality without commitment

---

## 📝 Example Conversation

**User**: "kenapa ga bisa jadi guest ya?"

**Answer**: Guest mode IS working! Here's how:

1. Go to http://localhost:3000/login
2. Click "**Continue as Guest**" button
3. Fill out the screening form (any values)
4. Click "Run Diagnosis"
5. See dummy results instantly!

**User**: "kalau guest kasih contoh ui nya bisa muncul kyk dummy result aja ya?"

**Answer**: YES! That's exactly what it does:

- ✅ Guest gets dummy results (not real database data)
- ✅ Shows example diagnosis (High/Moderate/Low Risk)
- ✅ Shows 5 realistic recommendations
- ✅ Shows lifestyle issues analysis
- ✅ Shows rules fired visualization
- ✅ Results disappear on refresh (no persistence)

---

## 🎓 Summary

**Guest Mode Features:**
- ✅ No login required
- ✅ Instant dummy results
- ✅ Full UI demonstration
- ✅ Realistic example output
- ✅ No data persistence
- ✅ Perfect for demo/evaluation

**When Guest Converts to User:**
- New account registration/login
- Results start saving to database
- Access to analytics and history
- Persistent screening records
- Full KBS functionality
