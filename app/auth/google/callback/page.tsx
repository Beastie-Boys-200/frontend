'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('Google authentication was cancelled');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      if (!code) {
        setError('No authorization code received');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/google/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Authentication failed');
        }

        await response.json();

        // Tokens are now in httpOnly cookies - no need to store in localStorage

        await refreshUser();
        router.push('/');
      } catch (err) {
        console.error('Google auth error:', err);
        setError('Authentication failed. Please try again.');
        setTimeout(() => router.push('/login'), 2000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {error ? (
          <div className="bg-gray-900 border border-red-500/50 rounded-lg p-8 text-center shadow-xl shadow-red-500/20">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Authentication Error
            </h2>
            <p className="text-red-400 mb-4">{error}</p>
            <p className="text-sm text-gray-400">Redirecting to login page...</p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 text-center shadow-xl shadow-pink-500/20">
            <div className="mb-6">
              <div className="relative inline-flex">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-pink-500 border-r-purple-600"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500/20 to-purple-600/20 blur-xl"></div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Completing Sign In
            </h2>
            <p className="text-gray-400">
              Please wait while we authenticate your account...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}