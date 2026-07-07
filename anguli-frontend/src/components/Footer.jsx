import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-2">Anguli.in</h3>
          <p className="text-sm text-gray-400">Aapka shahar, aapki pehchan. Apne gaon aur community se judne ka digital platform.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2">Quick Links</h4>
          <ul className="space-y-1 text-sm">
            <li><Link to="/villages" className="hover:text-white">Village Directory</Link></li>
            <li><Link to="/search" className="hover:text-white">Search</Link></li>
            <li><Link to="/register" className="hover:text-white">Join Anguli.in</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2">Contact</h4>
          <p className="text-sm text-gray-400">support@anguli.in</p>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Anguli.in — All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
