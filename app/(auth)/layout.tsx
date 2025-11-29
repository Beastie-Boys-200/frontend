'use client';

import React from 'react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col lg:flex-row">
      {/* Back to home button */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-gray-900/80 backdrop-blur-sm border border-pink-500/30 rounded-lg text-pink-400 hover:text-pink-300 hover:border-pink-500/50 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        <span className="hidden sm:inline">Back</span>
      </Link>

      {/* Left side - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative min-h-screen lg:min-h-0">
        {/* Neon glow effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-pink-500/20 rounded-full filter blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/20 rounded-full filter blur-3xl opacity-30 pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Right side - black block (placeholder for 3D visualization) */}
      <div className="hidden lg:block lg:w-1/2 relative lg:min-h-screen bg-black">
        <div className="absolute inset-0 flex items-center justify-center text-gray-600">
          <p className="text-xl">3D Visualization</p>
        </div>
      </div>
    </div>
  );
}