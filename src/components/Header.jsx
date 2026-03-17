import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Header({ onMenuClick }) {
  const { logout } = useAuth();

  return (
    <header className="h-16 bg-[#1e2336] shadow-sm flex justify-between items-center px-4 md:px-6">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="md:hidden text-slate-300 hover:text-white mr-4 p-1 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <Menu size={24} />
        </button>
      </div>
      <div>
        <button
          onClick={logout}
          className="flex items-center text-slate-300 hover:text-white p-2 transition-colors md:hidden"
          aria-label="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}

export default Header;
