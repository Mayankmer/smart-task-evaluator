import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Terminal } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  // Check if we are using the mock client (which doesn't have the 'url' property commonly found on real clients)
  // or checks environment variables to determine if we should render real Auth UI.
  const isMockClient = !import.meta.env.VITE_SUPABASE_URL;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
            <Terminal className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 mt-2">Sign in to access your AI evaluations</p>
        </div>

        {isMockClient ? (
          <div className="text-center">
            <div className="bg-amber-50 text-amber-800 p-4 rounded-md text-sm mb-4 border border-amber-200">
              <strong>Demo Mode:</strong> No Supabase keys detected.
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 font-medium transition-all"
            >
              Enter Demo Dashboard
            </button>
          </div>
        ) : (
          <Auth 
            supabaseClient={supabase} 
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#4f46e5',
                    brandAccent: '#4338ca',
                  }
                }
              }
            }}
            providers={['github', 'google']}
            redirectTo={window.location.origin + '/dashboard'}
          />
        )}
      </div>
    </div>
  );
};

export default LoginPage;