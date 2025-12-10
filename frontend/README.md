# Frontend - RSBP Sleep Health KBS

React-based single-page application for the Sleep Health Knowledge-Based System. Built with modern web technologies for a responsive and interactive user experience.

## Technology Stack

- **React 18** - UI library with Hooks
- **Vite 5** - Fast build tool and dev server
- **Tailwind CSS 3** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Chart.js & Recharts** - Data visualization
- **Framer Motion** - Animation library
- **Lucide React** - Icon system
- **React Hot Toast** - Toast notifications
- **Axios** - HTTP client

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Backend API running on http://localhost:5000 (or configured endpoint)

## Installation

```powershell
cd frontend
npm install
```

## Environment Configuration

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Sleep Health KBS
```

**Environment Variables:**
- `VITE_API_URL` - Backend API base URL
- `VITE_APP_NAME` - Application name displayed in UI

## Development

Start the development server:

```powershell
npm run dev
```

The application will be available at http://localhost:5173

**Development Features:**
- Hot Module Replacement (HMR)
- Fast refresh on file changes
- Source maps for debugging
- ESLint integration

## Build

Create a production build:

```powershell
npm run build
```

Build output: `dist/` directory

Preview production build locally:

```powershell
npm run preview
```

Preview server: http://localhost:4173

## Docker Deployment

Build Docker image:

```powershell
docker build -t sleep-health-frontend .
```

Run container:

```powershell
docker run -d -p 3000:80 --name frontend sleep-health-frontend
```

Access: http://localhost:3000

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable components
│   │   ├── Common/         # Shared UI components
│   │   ├── Dashboard/      # Dashboard-specific components
│   │   ├── History/        # History table components
│   │   ├── Layout/         # Layout components (Header, Sidebar)
│   │   └── Screening/      # Screening form components
│   ├── contexts/           # React Context providers
│   │   ├── AuthContext.jsx # Authentication context
│   │   └── ThemeContext.jsx# Theme management
│   ├── pages/              # Page components
│   │   ├── LandingPage.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ScreeningForm.jsx
│   │   ├── Results.jsx
│   │   ├── History.jsx
│   │   ├── Analytics.jsx
│   │   ├── Settings.jsx
│   │   ├── Help.jsx
│   │   ├── UIShowcase.jsx
│   │   └── ComponentLibrary.jsx
│   ├── store/              # State management
│   │   └── useAuthStore.js # Zustand auth store
│   ├── utils/              # Utility functions
│   │   ├── api.js          # Axios instance
│   │   └── constants.js    # App constants
│   ├── App.jsx             # Root component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── Dockerfile              # Container configuration
├── nginx.conf              # Nginx configuration
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
└── package.json            # Dependencies
```

## Available Routes

**Public Routes:**
- `/` - Landing page
- `/login` - User login
- `/register` - User registration
- `/showcase` - UI showcase hub
- `/components` - Component library
- `/api-docs` - API documentation

**Protected Routes:**
- `/dashboard` - Main dashboard
- `/screening` - Sleep screening form
- `/results` - Screening results
- `/history` - Screening history
- `/analytics` - Data analytics
- `/settings` - User settings
- `/help` - Help and support

## State Management

**Authentication:**
- React Context (AuthContext) - User state and auth methods
- Zustand (useAuthStore) - JWT token persistence

**Theme:**
- React Context (ThemeContext) - Dark/Light mode toggle

## API Integration

API client configured in `src/utils/api.js`:
- Axios interceptors for auth tokens
- Automatic error handling
- Request/response logging
- 401 redirect to login

## Styling

**Tailwind CSS:**
- Custom color palette (primary, secondary, accent)
- Dark mode support via data-theme attribute
- Custom breakpoints for responsive design
- Utility classes for rapid development

**Custom Variables (index.css):**
- CSS variables for theme colors
- Gradient backgrounds
- Shadow definitions
- Responsive utilities

## UI Components

**Common Components:**
- Button - Reusable button with variants
- Card - Content container
- Loader - Loading spinner
- ThemeToggle - Theme switcher

**Layout Components:**
- Header - Top navigation bar
- Sidebar - Desktop navigation
- Layout - Main layout wrapper

**Feature Components:**
- ScreeningForm - Multi-step form
- HistoryTable - Data table with filters
- StatsCard - Dashboard statistics
- RecentScreenings - Activity list

## Features

**User Experience:**
- Responsive design (mobile-first)
- Dark/Light theme support
- Smooth page transitions
- Toast notifications
- Loading states
- Error boundaries

**Data Visualization:**
- Chart.js for analytics charts
- Doughnut charts for risk assessment
- Bar charts for comparisons
- Trend analysis graphs

**Authentication:**
- JWT-based authentication
- Guest mode support
- Auto-logout on token expiry
- Protected route handling

**Export Functionality:**
- CSV export for screening history
- Report download (TXT format)
- Batch export support

## Development Tools

**Linting:**
```powershell
npm run lint
```

**Type Checking:**
- JSDoc comments for type hints
- Prop validation with PropTypes

**Browser DevTools:**
- React Developer Tools extension
- Redux DevTools (if applicable)

## Troubleshooting

**Port already in use:**
```powershell
# Change port in vite.config.js or use:
npm run dev -- --port 3001
```

**API connection errors:**
- Verify backend is running
- Check VITE_API_URL in .env
- Inspect Network tab in browser DevTools

**Build errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check for TypeScript errors in console

**Blank page after build:**
- Check browser console for errors
- Verify base path in vite.config.js
- Ensure all assets are correctly referenced

## Performance Optimization

- Code splitting with React.lazy()
- Image optimization
- Bundle size analysis: `npm run build -- --report`
- Tree shaking for unused code
- Minification in production

## Testing

The application supports manual testing workflows:
- Test authentication flows
- Validate form submissions
- Check responsive layouts
- Verify API integrations

## Contributing

When adding new features:
1. Follow existing code structure
2. Use Tailwind CSS for styling
3. Add PropTypes for component props
4. Update this README if needed

## Support

For issues or questions:
- Check troubleshooting section
- Review backend README for API details
- Inspect browser console for errors
