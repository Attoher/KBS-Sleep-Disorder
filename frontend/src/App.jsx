import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/Common/LoadingSpinner';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const History = lazy(() => import('./pages/History'));
const ScreeningForm = lazy(() => import('./pages/ScreeningForm'));
const Results = lazy(() => import('./pages/Results'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));
const Help = lazy(() => import('./pages/Help'));
const UIShowcase = lazy(() => import('./pages/UIShowcase'));
const ShowcaseResults = lazy(() => import('./pages/ShowcaseResults'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const ComponentLibrary = lazy(() => import('./pages/ComponentLibrary'));
const APIDocumentation = lazy(() => import('./pages/APIDocumentation'));

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
              },
            }}
          />
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/welcome" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* UI Showcase Routes (No Backend Required) */}
              <Route path="/showcase" element={<UIShowcase />} />
              <Route path="/showcase/results" element={<ShowcaseResults />} />
              <Route path="/components" element={<ComponentLibrary />} />
              <Route path="/api-docs" element={<APIDocumentation />} />

              <Route element={<Layout />}>
                <Route path="/dashboard" element={<PrivateRoute allowGuest><Dashboard /></PrivateRoute>} />
                <Route path="/screening" element={<PrivateRoute allowGuest><ScreeningForm /></PrivateRoute>} />
                <Route path="/results" element={<PrivateRoute allowGuest><Results /></PrivateRoute>} />
                <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
                <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                <Route path="/help" element={<PrivateRoute allowGuest><Help /></PrivateRoute>} />
              </Route>

              <Route path="*" element={<Navigate to="/welcome" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;