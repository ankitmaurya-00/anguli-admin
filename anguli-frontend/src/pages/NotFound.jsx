import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="max-w-lg mx-auto px-4 py-24 text-center">
    <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
    <p className="text-gray-600 mb-6">Page not found.</p>
    <Link to="/" className="bg-primary-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-primary-700">
      Home Jaayein
    </Link>
  </div>
);

export default NotFound;
