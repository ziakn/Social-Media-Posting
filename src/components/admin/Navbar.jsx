'use client';

import React from 'react';

export default function Navbar() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 shadow-sm">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold tracking-tight">Admin Panel</h1>
      </div>

      <div className="ml-auto flex items-center space-x-4">
        {/* Example user info */}
        <div className="text-sm font-medium text-gray-700">Admin User</div>
        <button
          className="px-3 py-1 rounded-md text-sm text-red-600 hover:bg-red-100"
          onClick={() => {
            // Add logout logic here
            alert('Logout clicked');
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
