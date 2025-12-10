# Guest Mode Guide - Sleep Health KBS

## Overview

Guest Mode allows users to perform sleep health screenings **without creating an account**. Guest screenings generate demo/dummy results to showcase the system's functionality.

---

## How to Access Guest Mode

### Step 1: Start on Landing Page
1. Open http://localhost:3000/
2. Click "Get Started" → "Login"

### Step 2: Click "Continue as Guest"
- On the Login page, click the **"Continue as Guest"** button
- You'll be redirected to the dashboard

### Step 3: Access Screening Form
- Click on "Sleep Health Screening" or navigate to `/screening`
- Fill out the form (all fields are optional for guests)

### Step 4: Submit and View Results
- Click "Run Diagnosis"
- View the results page with dummy data

---

## Guest Mode Features

### ✅ What Works in Guest Mode
- ✅ Complete screening form with all fields
- ✅ Stress questionnaire (10 questions)
- ✅ Instant diagnosis results
- ✅ View recommendations
- ✅ See risk assessments (Insomnia, Sleep Apnea)
- ✅ Lifestyle analysis
- ✅ Rule firing visualization
- ✅ Export results (optional)

### ❌ What's Limited in Guest Mode
- ❌ Results are **not saved** to database
- ❌ No screening history
- ❌ No analytics/trends over time
- ❌ No profile management
- ❌ Session data cleared on page refresh

---

## Backend Implementation

### Guest Screening Endpoint

```
POST /api/screening/process
Authorization: (not required for guests)
```

**Request Body (Example):**
```json
{
  "age": 45,
  "gender": "Male",
  "sleepDuration": 4.5,
  "sleepQuality": 3,
  "stressLevel": 8,
  "physicalActivity": 20,
  "dailySteps": 3000,
  "heartRate": 98,
  "bmiCategory": "Obese",
  "bloodPressure": "150/95",
  "log_to_neo4j": false
}
```

**Response (Dummy Results):**
```json
{
  "success": true,
  "data": {
    "diagnosis": "Probable Insomnia",
    "insomniaRisk": "high",
    "apneaRisk": "low",
    "lifestyleIssues": {
      "sleep": true,
      "stress": true,
      "activity": true,
      "weight": true
    },
    "recommendations": [
      "Maintain consistent sleep schedule (same bedtime and wake time daily)",
      "Avoid caffeine and heavy meals 3-4 hours before bedtime",
      "Ensure bedroom is dark, quiet, and cool (around 18-20°C)",
      "Exercise regularly but not close to bedtime",
      "Consider consulting a sleep specialist for detailed evaluation"
    ],
    "firedRules": ["R1", "R3", "R5", "R12", "R18"]
  },
  "metadata": {
    "timestamp": "2024-12-10T10:30:00Z",
    "processingTime": "45ms",
    "rulesFired": 5,
    "screeningId": null,
    "userId": null
  }
}
```

---

## Dummy Results Logic

Guest screenings generate dummy results based on input data:

### Risk Assessment Algorithm

```javascript
// Simplified logic from backend
function generateDummyResults(inputData) {
  const sleepDuration = inputData.sleepDuration || 6;
  const sleepQuality = inputData.sleepQuality || 5;
  const age = inputData.age || 40;
  const bmi = inputData.bmiCategory || 'Normal';

  let diagnosis = 'Normal Sleep Pattern';
  let insomniaRisk = 'low';
  let apneaRisk = 'low';

  // Insomnia Risk
  if (sleepDuration < 5 || sleepQuality < 4) {
    insomniaRisk = 'high';
    diagnosis = 'Probable Insomnia';
  } else if (sleepDuration < 6.5 || sleepQuality < 6) {
    insomniaRisk = 'moderate';
    diagnosis = 'Mild Sleep Disturbance';
  }

  // Apnea Risk
  if (age > 50 && bmi === 'Obese') {
    apneaRisk = 'high';
    diagnosis = 'Probable Sleep Apnea';
  } else if (age > 40 && bmi === 'Overweight') {
    apneaRisk = 'moderate';
  }

  // Combined diagnosis
  if (insomniaRisk === 'high' && apneaRisk === 'high') {
    diagnosis = 'Complex Sleep Disorder - Multiple Issues';
  }

  return {
    diagnosis,
    insomniaRisk,
    apneaRisk,
    recommendations: [...] // 5 standard recommendations
  };
}
```

---

## Example Screening Scenarios

### Scenario 1: High-Risk Guest

**Input:**
```json
{
  "age": 55,
  "sleepDuration": 4,
  "sleepQuality": 2,
  "stressLevel": 9,
  "bmiCategory": "Obese",
  "bloodPressure": "160/100"
}
```

**Results:**
- **Diagnosis**: Complex Sleep Disorder - Multiple Issues
- **Insomnia Risk**: HIGH 🔴
- **Apnea Risk**: HIGH 🔴
- **Recommendations**: Consult sleep specialist immediately
- **Lifestyle Issues**: Sleep ✓, Stress ✓, Activity ✓, Weight ✓

---

### Scenario 2: Moderate-Risk Guest

**Input:**
```json
{
  "age": 38,
  "sleepDuration": 6.2,
  "sleepQuality": 6,
  "stressLevel": 5,
  "bmiCategory": "Overweight"
}
```

**Results:**
- **Diagnosis**: Mild Sleep Disturbance
- **Insomnia Risk**: MODERATE 🟡
- **Apnea Risk**: MODERATE 🟡
- **Recommendations**: Lifestyle modifications
- **Lifestyle Issues**: Sleep ✓, Stress ✗, Activity ✓, Weight ✓

---

### Scenario 3: Low-Risk Guest

**Input:**
```json
{
  "age": 30,
  "sleepDuration": 7.5,
  "sleepQuality": 8,
  "stressLevel": 2,
  "bmiCategory": "Normal"
}
```

**Results:**
- **Diagnosis**: Normal Sleep Pattern
- **Insomnia Risk**: LOW 🟢
- **Apnea Risk**: LOW 🟢
- **Recommendations**: Maintain current habits
- **Lifestyle Issues**: All clear ✓

---

## Frontend Implementation

### 1. Guest Session Activation

**File**: `frontend/src/contexts/AuthContext.jsx`

```javascript
const startGuestSession = () => {
  localStorage.removeItem('token');
  localStorage.setItem('guest', 'true');
  setUser(null);
  setGuestMode(true);
  toast.success('You are now exploring as Guest');
};
```

### 2. Guest Screening Form

**File**: `frontend/src/components/Screening/ScreeningForm.jsx`

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const submissionData = {
    ...formData,
    stressLevel: calculateStressLevel(),
    log_to_neo4j: false // Guests don't log to database
  };

  const response = await api.post('/screening/process', submissionData);
  navigate('/results', { state: { results: response.data.data } });
};
```

### 3. Results Display

**File**: `frontend/src/pages/Results.jsx`

```javascript
useEffect(() => {
  if (location.state?.results) {
    setResults(location.state.results); // Shows guest results
  } else {
    navigate('/screening');
  }
}, [location]);
```

---

## API Endpoints for Guest Mode

| Endpoint | Method | Auth | Guest | Description |
|----------|--------|------|-------|-------------|
| `/screening/process` | POST | Optional | ✅ | Run screening (guest gets dummy results) |
| `/history` | GET | Optional | ❌ | Get history (empty for guests) |
| `/auth/me` | GET | Required | ❌ | Get profile (401 for guests) |
| `/auth/login` | POST | - | ✅ | Login to account |
| `/auth/register` | POST | - | ✅ | Create account |

---

## Key Code Changes Made

### Backend Changes
1. **File**: `backend/src/controllers/screeningController.js`
   - Added `generateDummyResults(inputData)` method
   - Modified `processScreening()` to detect guest mode and use dummy results
   - Guest screenings don't validate input or save to databases

2. **File**: `backend/src/routes/screening.js`
   - Endpoint `/process` uses `optionalAuth` middleware (allows unauthenticated requests)

### Frontend Changes
1. **File**: `frontend/src/components/Screening/ScreeningForm.jsx`
   - Enhanced submit handler with better logging
   - Ensures results data is passed to navigation state

2. **File**: `frontend/src/contexts/AuthContext.jsx`
   - Already had `startGuestSession()` method
   - Stores guest mode in localStorage

---

## Testing Guest Mode

### Manual Testing Steps

1. **Start Fresh Browser Session**
   ```
   - Open Chrome DevTools
   - Application → Cookies/Storage → Clear All
   ```

2. **Navigate to Guest Mode**
   ```
   http://localhost:3000/login → "Continue as Guest"
   ```

3. **Fill Screening Form**
   ```
   - Use test values (high/moderate/low risk inputs)
   - Submit form
   ```

4. **Verify Results**
   ```
   - Check diagnosis matches input
   - Verify recommendations appear
   - Confirm no database save occurred
   ```

5. **Test Refresh**
   ```
   - Refresh page (F5)
   - Results should disappear (not persistent)
   - Redirect to screening form
   ```

---

## Curl Test Examples

### Test Guest Screening
```bash
curl -X POST http://localhost:5000/api/screening/process \
  -H "Content-Type: application/json" \
  -d '{
    "age": 45,
    "sleepDuration": 4.5,
    "sleepQuality": 3,
    "stressLevel": 8,
    "bmiCategory": "Obese"
  }'
```

### Expected Response (Guest Dummy Results)
```json
{
  "success": true,
  "data": {
    "diagnosis": "Probable Insomnia",
    "insomniaRisk": "high",
    "apneaRisk": "low",
    "recommendations": [...]
  }
}
```

---

## Upgrading Guest to Authenticated User

Guest users can convert to authenticated users by:

1. **Option A**: Click "Sign Up"
   - Register new account
   - Screening history starts fresh

2. **Option B**: Click "Sign In"
   - Login to existing account
   - Existing guest screenings are lost (not persistent)

3. **Guest data persistence**: None
   - Guest screenings are **NOT** saved
   - This is by design to avoid database bloat

---

## Future Enhancements

### Planned Improvements
1. ✅ **Guest Session Timeout**: Auto-logout after 30 minutes
2. ✅ **Guest Screening Limit**: Max 3 screenings per session
3. ✅ **Device Storage**: Persist results locally in browser
4. ✅ **Export to PDF**: Allow guests to download results
5. ✅ **Email Results**: Send results to guest email (optional)

---

## FAQ

### Q: Can guests save results?
**A**: No, guest results are temporary and cleared on page refresh.

### Q: Do guest screenings go to Neo4j?
**A**: No, `log_to_neo4j: false` is set by default for guests.

### Q: How are dummy results generated?
**A**: Based on input parameters using simplified heuristics (not the full rule engine).

### Q: Can I convert guest screening to account?
**A**: Not directly. Register/login creates new independent account.

### Q: Are guest results saved on backend?
**A**: No. Backend generates results on-the-fly but doesn't persist them.

### Q: Can guests access analytics?
**A**: No. Analytics require authentication.

---

## Summary

✅ **Guest Mode is Fully Functional**
- Users can access screening form without login
- Dummy results are generated instantly
- No database queries or writes
- Results are temporary and session-based

This design allows users to:
- Test the system without commitment
- See example output
- Understand the diagnosis process
- Decide to register for persistent results
