# UI Showcase & Developer Tools - Complete Guide

## 🎯 Overview

The UI Showcase system provides a comprehensive preview environment for all frontend interfaces, component documentation, and API references. Perfect for development, design review, and client presentations.

## 🚀 Quick Access

### Entry Points
- **Welcome Page**: `http://localhost:5173/welcome` - Main landing page
- **Showcase Hub**: `http://localhost:5173/showcase` - All UI interfaces gallery
- **Component Library**: `http://localhost:5173/components` - Reusable components docs
- **API Documentation**: `http://localhost:5173/api-docs` - Backend endpoints reference

### From Within App
1. **From Login/Register**: Click "🎨 View UI Showcase" at bottom
2. **From Header** (Desktop): Click "Showcase" button in navigation
3. **From User Menu** (Mobile): Select "🎨 UI Showcase" option

## 📖 Available Pages in Showcase

### Application Pages (8 total)
| Page | Route | Features |
|------|-------|----------|
| **Login** | `/login` | Email/password auth, guest mode option, theme toggle |
| **Register** | `/register` | User registration form, validation, optional demographics |
| **Dashboard** | `/dashboard` | Stats cards, recent screenings, quick actions |
| **Screening Form** | `/screening` | Sleep questionnaire, 10-question stress assessment, health metrics |
| **Results** | `/showcase/results` | Mock diagnosis display, risk levels, recommendations |
| **History** | `/history` | Past screening records, filtering, export options |
| **Analytics** | `/analytics` | Data visualization, insights, trends |
| **Components** | `/components` | Component library, usage examples, prop documentation |

### Documentation Pages (2 total)
| Page | Route | Content |
|------|-------|---------|
| **Component Library** | `/components` | 8+ reusable components with examples, props, and styling system |
| **API Documentation** | `/api-docs` | REST endpoints, authentication, request/response formats |

## 🎨 Component Library (`/components`)

### Available Components

#### Layout Components
- **Header** - Top navigation with user menu and theme toggle
- **Sidebar** - Main navigation sidebar for dashboard
- **Layout** - Main app layout wrapper with header and sidebar

#### Common Components
- **Button** - Primary action button with variants (primary, secondary, outline)
- **Card** - Container component with CardHeader and CardBody sections
- **Loader** - Loading spinner animation
- **ThemeToggle** - Theme switcher for light/dark mode

#### Page Components
- **PrivateRoute** - Route protection with optional guest mode support
- **ScreeningForm** - Sleep health questionnaire form
- **Dashboard** - Main dashboard with statistics

### Styling System

#### CSS Variables (Theme Support)
```css
--text-primary        /* Primary text color */
--text-secondary      /* Secondary text color */
--bg-primary          /* Primary background */
--bg-surface          /* Surface background */
--border-color        /* Border color */
--accent-color        /* Accent color */
```

#### Utility Classes
```
.app-bg              /* Full page background */
.surface             /* Main container background */
.surface-secondary   /* Secondary container */
.surface-muted       /* Muted/subtle background */
.input-surface       /* Input field styling */
.text-primary        /* Primary text */
.text-secondary      /* Secondary text */
.border-app          /* App-wide border color */
```

## 📡 API Documentation (`/api-docs`)

### Endpoint Groups

#### Authentication (`/auth`)
- `POST /auth/register` - Create new account
- `POST /auth/login` - User login, get JWT token

#### Screening (`/screening`)
- `POST /screening/process` - Process screening and get diagnosis

#### History (`/history`)
- `GET /history/all` - Get all screenings (requires auth)
- `GET /history/:id` - Get specific screening details (requires auth)

#### Analytics (`/analytics`)
- `GET /analytics/summary` - Analytics summary (requires auth)
- `GET /analytics/graph` - Neo4j graph data (requires auth)

### Request/Response Format
```javascript
{
  success: true/false,
  data: { /* response data */ },
  error: "error message" // on failure
}
```

## 🌐 Navigation Flow

```
Welcome (/welcome)
├── Login (/login)
│   ├── Register (/register)
│   └── Showcase (/showcase)
│
├── Register (/register)
│   ├── Login (/login)
│   └── Showcase (/showcase)
│
└── Showcase (/showcase)
    ├── Pages Gallery
    │   ├── Login, Register, Dashboard, Screening, etc.
    │   └── Mock Results (/showcase/results)
    ├── Components (/components)
    └── API Docs (/api-docs)
```

## 💡 Use Cases

### 1. UI/UX Design Review
```
Navigate to /showcase → Click pages → Review designs in light/dark mode
```

### 2. Component Development
```
Go to /components → View component examples → Copy code → Use in development
```

### 3. API Integration Testing
```
Visit /api-docs → Review endpoints → See request/response formats → Implement in backend
```

### 4. Client Presentation
```
Open /showcase → Navigate through user flows → Toggle themes → Present features
```

### 5. Onboarding New Developers
```
Welcome page → Showcase tour → Component library → API docs → Start coding
```

## 🔧 Features & Capabilities

### ✅ Theme Support
- Light/Dark mode on all pages
- Theme persistence across navigation
- Theme-aware components and colors

### ✅ No Backend Required
- All pages work without server connection
- Mock data for realistic previews
- Offline-first design

### ✅ Responsive Design
- Mobile, tablet, desktop optimized
- Touch-friendly interfaces
- Adaptive layouts

### ✅ Interactive Navigation
- Click cards to view pages
- Back buttons on showcase pages
- Breadcrumb support

### ✅ Developer Tools
- Component code examples
- Copy-to-clipboard functionality
- API endpoint reference
- Styling system documentation

## 📝 Mock Data Examples

### Screening Input (Showcase)
```javascript
{
  age: 45,
  gender: 'Male',
  sleepDuration: 4.5,
  sleepQuality: 3,
  stressLevel: 8,
  physicalActivity: 20,
  dailySteps: 3000,
  heartRate: 98,
  bmiCategory: 'Obese',
  bloodPressure: '150/95'
}
```

### Diagnosis Result (Mock)
```javascript
{
  diagnosis: 'High Risk Insomnia + Moderate Risk Sleep Apnea',
  insomnia_risk: 'high',
  apnea_risk: 'moderate',
  firedRules: ['R1', 'R3', 'R5', 'R12', 'R18', 'R25'],
  recommendations: [
    'Consult with a sleep specialist immediately',
    'Consider cognitive behavioral therapy for insomnia (CBT-I)',
    '...'
  ]
}
```

## 🔐 Security Notes

- Showcase pages are PUBLIC routes (no authentication)
- No actual data is stored or transmitted
- Safe to share with non-technical stakeholders
- Mock data only - for demonstration purposes

## 🚦 Getting Started

### Step 1: Start Frontend
```powershell
cd frontend
npm run dev
# App runs on http://localhost:5173
```

### Step 2: Access Welcome Page
```
http://localhost:5173/welcome
```

### Step 3: Navigate
- Click "UI Showcase" card to explore all pages
- Click "Components" to view component library
- From Showcase, click "Components" or "API Docs" for documentation

## 🎯 Developer Workflow

```
1. Start with Welcome page (/welcome)
2. Browse Showcase (/showcase) for UI/UX overview
3. Review Components (/components) for implementation details
4. Check API Docs (/api-docs) for backend integration
5. Start implementation in Dashboard or Screening pages
```

## 📚 Related Documentation

- See `SHOWCASE_README.md` for original showcase documentation
- See `frontend/README.md` for frontend setup and configuration
- See backend README for API implementation details

## 🔄 Future Enhancements

- [ ] Storybook integration for component development
- [ ] Design tokens playground
- [ ] Interactive API tester
- [ ] Component playground with live editing
- [ ] Accessibility checker
- [ ] Performance metrics viewer
- [ ] Screenshot export functionality

## 💬 Support

For questions or issues with the showcase system:
1. Check this documentation
2. Review component examples in `/components`
3. Check API reference in `/api-docs`
4. See backend README for API implementation

---

**Last Updated**: December 8, 2025
**Version**: 1.0
**Status**: Production Ready
