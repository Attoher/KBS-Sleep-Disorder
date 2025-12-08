import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import ScreeningForm from './pages/ScreeningForm';
import Results from './pages/Results';
import Analytics from './pages/Analytics';
import UIShowcase from './pages/UIShowcase';
import ShowcaseResults from './pages/ShowcaseResults';
import LandingPage from './pages/LandingPage';
import ComponentLibrary from './pages/ComponentLibrary';
import APIDocumentation from './pages/APIDocumentation';

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
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<PrivateRoute allowGuest><Dashboard /></PrivateRoute>} />
              <Route path="/screening" element={<PrivateRoute allowGuest><ScreeningForm /></PrivateRoute>} />
              <Route path="/results" element={<PrivateRoute allowGuest><Results /></PrivateRoute>} />
              <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
              <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
            </Route>
            
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;