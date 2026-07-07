import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiHome, FiUsers, FiMapPin, FiFileText, FiFlag, FiLogOut, FiGrid } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { href: '/', label: 'Dashboard', icon: FiHome },
  { href: '/users', label: 'Users', icon: FiUsers },
  { href: '/villages', label: 'Master Data', icon: FiMapPin },
  { href: '/posts', label: 'Content Moderation', icon: FiFileText },
  { href: '/reports', label: 'Reports', icon: FiFlag },
];

const Layout = ({ children }) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col">
        <div className="flex items-center gap-2 px-6 py-5 text-white font-bold text-lg border-b border-gray-800">
          <FiGrid /> Anguli.in Admin
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = router.pathname === item.href || router.pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                  active ? 'bg-primary-600 text-white' : 'hover:bg-gray-800'
                }`}
              >
                <Icon size={16} /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-gray-800">
          <p className="text-xs text-gray-400 mb-2">{user?.name} ({user?.role})</p>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300">
            <FiLogOut size={14} /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 p-8 overflow-y-auto">{children}</main>
    </div>
  );
};

export default Layout;
