import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-2xl text-gray-400 mb-4">Page Not Found</p>
      <p className="text-center text-gray-300 mb-8">
        The page you are looking for does not exist. It may have been moved or deleted.
      </p>
      <Link to="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-semibold transition">
        Go to Home Page
      </Link>
    </div>
  );
}

export default NotFound;