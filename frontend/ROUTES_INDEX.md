# Frontend Routes & Pages Index

## 📍 Route Map

### Public Routes (No Auth Required)

#### Landing & Auth Pages
```
/welcome                    → LandingPage
  └─ Main landing page with quick access to showcase and auth

/login                      → Login
  ├─ Email/Password authentication
  ├─ Guest mode option
  ├─ Link to register
  └─ Link to showcase

/register                   → Register
  ├─ New user registration
  ├─ Demographics collection
  ├─ Password validation
  ├─ Link to login
  └─ Link to showcase
```

#### UI Showcase & Developer Tools
```
/showcase                   → UIShowcase
  ├─ Gallery of all available pages
  ├─ Quick links to each page
  ├─ Links to components and API docs
  └─ Theme toggle support

/showcase/results           → ShowcaseResults
  ├─ Mock diagnosis results page
  ├─ Demonstrates result layout
  ├─ Shows risk assessment UI
  └─ Includes recommendations display

/components                 → ComponentLibrary
  ├─ 8+ reusable components documentation
  ├─ Code examples with copy-to-clipboard
  ├─ Props and variants listing
  ├─ Styling system reference
  └─ Links to other docs

/api-docs                   → APIDocumentation
  ├─ REST API endpoints reference
  ├─ All 4 endpoint groups (auth, screening, history, analytics)
  ├─ Request/response formats
  ├─ Authentication requirements
  └─ Implementation notes
```

### Protected Routes (Requires Authentication or Guest Mode)

#### Main Application
```
/dashboard                  → Dashboard
  ├─ User statistics
  ├─ Recent screenings
  ├─ Quick action links
  ├─ Header with user menu
  ├─ Sidebar navigation
  └─ Guest mode allowed

/screening                  → ScreeningForm
  ├─ Sleep health questionnaire
  ├─ 10 lifestyle/health fields
  ├─ 10-question stress assessment (q1-q10)
  ├─ Health metrics input
  ├─ Neo4j logging toggle
  └─ Guest mode allowed

/results                    → Results
  ├─ Diagnosis display
  ├─ Risk assessments (insomnia + apnea)
  ├─ Triggered rules list
  ├─ Recommendations
  ├─ Input data summary
  └─ Guest mode allowed

/history                    → History (AUTH REQUIRED)
  ├─ Screening history table
  ├─ Date and diagnosis display
  ├─ Filtering and sorting
  ├─ Record details view
  └─ Full authentication required

/analytics                  → Analytics (AUTH REQUIRED)
  ├─ Data visualization
  ├─ Statistical insights
  ├─ Trend analysis
  ├─ Graph database integration
  └─ Full authentication required
```

### Layout Structure
```
/dashboard
/screening
/results
/history
/analytics
  └─ All wrapped with: Layout (Header + Sidebar)
```

## 🔗 Navigation Hierarchy

```
LandingPage (/welcome)
├── Showcase Hub (/showcase)
│   ├── All 7 App Pages
│   │   ├── Login (/login)
│   │   ├── Register (/register)
│   │   ├── Dashboard (/dashboard)
│   │   ├── Screening (/screening)
│   │   ├── Results (/showcase/results)
│   │   ├── History (/history)
│   │   └── Analytics (/analytics)
│   ├── Components (/components)
│   └── API Docs (/api-docs)
├── Components (/components)
│   ├── Back to Showcase
│   ├── API Docs
│   └── Home
├── API Docs (/api-docs)
│   ├── Back to Showcase
│   ├── Components
│   └── Home
├── Authentication Pages
│   ├── Login (/login)
│   ├── Register (/register)
│   └── Both link to Showcase
└── Main App (After Login)
    ├── Dashboard
    ├── Screening
    ├── Results
    ├── History
    ├── Analytics
    └── Header Showcase Link
```

## 📊 Pages Summary

### Total Pages: 11

#### Showcase Pages (4)
1. **UIShowcase** - Gallery view of all pages
2. **ShowcaseResults** - Mock results display
3. **ComponentLibrary** - Component documentation
4. **APIDocumentation** - API reference

#### Application Pages (5)
5. **Login** - Authentication
6. **Register** - User registration
7. **Dashboard** - Main dashboard
8. **Screening** - Health questionnaire
9. **History** - Past records

#### Layout Pages (2)
10. **Results** - Diagnosis results
11. **Analytics** - Data visualization

## 🎯 Page Features by Route

### Authentication Pages
| Feature | Login | Register |
|---------|-------|----------|
| Theme Toggle | ✅ | ✅ |
| Showcase Link | ✅ | ✅ |
| Back Button | ✅ | ✅ |
| Form Validation | ✅ | ✅ |
| Guest Mode | ✅ | ❌ |

### Showcase Pages
| Feature | Gallery | Results | Components | API Docs |
|---------|---------|---------|-----------|----------|
| Mock Data | ✅ | ✅ | ✅ | ✅ |
| No Backend | ✅ | ✅ | ✅ | ✅ |
| Theme Support | ✅ | ✅ | ✅ | ✅ |
| Inter-linking | ✅ | ✅ | ✅ | ✅ |

### App Pages
| Feature | Dashboard | Screening | Results | History | Analytics |
|---------|-----------|-----------|---------|---------|-----------|
| Header | ✅ | ✅ | ✅ | ✅ | ✅ |
| Sidebar | ✅ | ✅ | ✅ | ✅ | ✅ |
| Auth Required | Guest OK | Guest OK | Guest OK | ✅ | ✅ |
| Theme Support | ✅ | ✅ | ✅ | ✅ | ✅ |

## 🚀 URL Quick Reference

```javascript
// Landing & Auth
/welcome              // Main landing page
/login                // Login form
/register             // Registration form

// Showcase & Docs
/showcase             // UI gallery
/showcase/results     // Mock results
/components           // Component library
/api-docs             // API reference

// Main App
/dashboard            // User dashboard
/screening            // Health questionnaire
/results              // Diagnosis results
/history              // Past screenings
/analytics            // Data insights

// Default Routes
/                     // Redirects to /dashboard
/*                    // Redirects to /login
```

## 📱 Mobile/Responsive Behavior

### Mobile Optimizations
- Sidebar collapses on mobile
- Showcase link in user menu (mobile only)
- Touch-friendly buttons and spacing
- Stack layouts for smaller screens

### Breakpoints
- SM: 640px (tablets)
- MD: 768px (larger tablets)
- LG: 1024px (desktops)
- XL: 1280px (large desktops)

## 🔐 Authentication Flow

```
User visits /
  ↓
Check authentication status
  ├─ Authenticated → /dashboard
  ├─ Guest mode → /dashboard (limited features)
  └─ Not authenticated → /login
      ↓
  User can:
  ├─ Login → /dashboard
  ├─ Register → /login
  └─ View Showcase → /showcase (no auth needed)
```

## 🔄 Redirect Rules

```
/ → /dashboard (or /login if not authenticated)
/showcase/* → Public routes (no auth required)
/showcase/results → Public showcase page
/components → Public documentation
/api-docs → Public documentation
/dashboard → Protected (guest allowed)
/screening → Protected (guest allowed)
/results → Protected (guest allowed)
/history → Protected (auth required)
/analytics → Protected (auth required)
/* → /login (unknown routes redirect)
```

## 📚 Component Pages Used

### UIShowcase
- Card (with hover effects)
- Button
- Layout structure (without header/sidebar)

### ComponentLibrary
- Card (displaying components)
- Button (variants)
- ThemeToggle
- Code display

### APIDocumentation
- Card (for endpoints)
- Button (navigation)
- Code blocks (JSON)

### All Showcase Pages
- Full theme support
- Motion animations (Framer Motion)
- Lucide icons
- React Hot Toast notifications

## 🎨 Theme Behavior

- All routes respect light/dark theme
- Theme toggle available on public pages
- Theme persists across navigation
- CSS variables update dynamically

---

**Last Updated**: December 8, 2025
**Total Routes**: 15
**Status**: Complete
