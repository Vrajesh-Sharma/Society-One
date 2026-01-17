import { LogOut, Home } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Navbar({ user, society, onLogout }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    localStorage.removeItem('society');
    onLogout();
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Home className="w-6 h-6" />
          <div>
            <h1 className="font-bold text-lg">{society.name}</h1>
            <p className="text-xs opacity-90">{user.name} • {user.flat_number}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </nav>
  );
}
