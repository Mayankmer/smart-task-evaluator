import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Navbar from './components/Navbar';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import EvaluatePage from './pages/Evaluate';
import ReportPage from './pages/Report';
import { Loader2 } from 'lucide-react';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Listen for auth changes (login, logout, auto-refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show a loading spinner while checking auth state to prevent flashing "Login" page
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-indigo-500" />
        <p>Initializing...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Navbar session={session} />
        
        <Routes>
          {/* Public Route */}
          <Route 
            path="/login" 
            element={!session ? <LoginPage /> : <Navigate to="/dashboard" replace />} 
          />
          
          {/* Protected Routes - Redirect to /login if no session */}
          <Route 
            path="/dashboard" 
            element={session ? <Dashboard /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/evaluate" 
            element={session ? <EvaluatePage /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/report/:id" 
            element={session ? <ReportPage /> : <Navigate to="/login" replace />} 
          />
          
          {/* Default Redirect */}
          <Route 
            path="/" 
            element={<Navigate to={session ? "/dashboard" : "/login"} replace />} 
          />
          
          {/* Catch-all for 404s */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;