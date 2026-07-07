import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiBell, FiBookmark, FiMenu, FiX, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-700">
          <span className="bg-primary-600 text-white rounded-lg w-9 h-9 flex items-center justify-center">A</span>
          Anguli.in
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link to="/villages" className="hover:text-primary-600">Village Directory</Link>
          <Link to="/search" className="hover:text-primary-600 flex items-center gap-1"><FiSearch /> Search</Link>
          {user && <Link to="/feed" className="hover:text-primary-600">Community Feed</Link>}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link to="/bookmarks" title="Bookmarks" className="text-gray-600 hover:text-primary-600"><FiBookmark size={20} /></Link>
              <Link to="/notifications" title="Notifications" className="text-gray-600 hover:text-primary-600"><FiBell size={20} /></Link>
              {isAdmin && (
                <a href={import.meta.env.VITE_ADMIN_URL || 'http://localhost:3001'} target="_blank" rel="noreferrer" className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded-lg">Admin Panel</a>
              )}
              <Link to={`/profile/${user._id}`} className="flex items-center gap-2">
                <img
                  src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border"
                />
              </Link>
              <button onClick={handleLogout} title="Logout" className="text-gray-500 hover:text-red-600"><FiLogOut size={20} /></button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary-600">Login</Link>
              <Link to="/register" className="text-sm font-medium bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">Register</Link>
            </>
          )}
        </div>

        <button className="md:hidden text-gray-700" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-3 space-y-3">
          <Link to="/villages" onClick={() => setMenuOpen(false)} className="block text-gray-700">Village Directory</Link>
          <Link to="/search" onClick={() => setMenuOpen(false)} className="block text-gray-700">Search</Link>
          {user ? (
            <>
              <Link to="/feed" onClick={() => setMenuOpen(false)} className="block text-gray-700">Community Feed</Link>
              <Link to="/notifications" onClick={() => setMenuOpen(false)} className="block text-gray-700">Notifications</Link>
              <Link to="/bookmarks" onClick={() => setMenuOpen(false)} className="block text-gray-700">Bookmarks</Link>
              <Link to={`/profile/${user._id}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-gray-700"><FiUser /> My Profile</Link>
              {isAdmin && <a href={import.meta.env.VITE_ADMIN_URL || 'http://localhost:3001'} className="block text-gray-700">Admin Panel</a>}
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-600"><FiLogOut /> Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-gray-700">Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="block bg-primary-600 text-white px-4 py-2 rounded-lg text-center">Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
