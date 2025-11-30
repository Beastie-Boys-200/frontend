'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FormActivityProvider, useFormActivity } from '@/contexts/FormActivityContext';

// Dynamic import of 3D component to avoid SSR issues
const NetworkVisualization = dynamic(
  () => import('@/components/3d/NetworkVisualization').then(mod => mod.NetworkVisualization),
  { ssr: false }
);

function AuthLayoutContent({ children }: { children: React.ReactNode }) {
  const { inputActivity } = useFormActivity();
  const [key, setKey] = useState(0);

  // Re-render on resize to fix 3D canvas issues
  useEffect(() => {
    const handleResize = () => {
      setKey(prev => prev + 1);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col lg:flex-row">
      {/* Back to home button */}
      <Link
        href="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-900/80 backdrop-blur-sm border border-pink-500/30 rounded-lg text-pink-400 hover:text-pink-300 hover:border-pink-500/50 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        <span className="hidden sm:inline text-sm">Back</span>
      </Link>

      {/* Left side - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 pt-20 sm:pt-8 relative min-h-screen lg:min-h-0">
        {/* Neon glow effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-pink-500/20 rounded-full filter blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/20 rounded-full filter blur-3xl opacity-30 pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Right side - 3D visualization (desktop only) */}
      <div className="hidden lg:block lg:w-1/2 relative lg:min-h-screen">
        <NetworkVisualization key={key} inputActivity={inputActivity} />
      </div>
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FormActivityProvider>
      <AuthLayoutContent>{children}</AuthLayoutContent>
    </FormActivityProvider>
  );
}