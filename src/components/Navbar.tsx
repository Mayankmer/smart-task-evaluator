import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Terminal, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface NavbarProps {
  session: any;
}

const Navbar: React.FC<NavbarProps> = ({ session }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors">
        <Terminal className="h-6 w-6" />
        <span className="font-bold text-xl tracking-tight">SmartEval.ai</span>
      </Link>
      
      {session && (
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors">
            Dashboard
          </Link>
          <Link to="/evaluate" className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors">
            New Evaluation
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors text-sm font-medium"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;