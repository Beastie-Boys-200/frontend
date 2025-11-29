'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleIcon } from '@/components/icons/OAuthIcons';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors: Record<string, string> = {};
    if (!formData.email) {
      validationErrors.email = 'Email required';
    }
    if (!formData.password) {
      validationErrors.password = 'Password required';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.email, formData.password, formData.rememberMe);
      router.push('/');
    } catch (error: unknown) {
      const err = error as { errors?: Record<string, string[]>; message?: string };
      if (err.errors) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(err.errors).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            if (key === 'non_field_errors') {
              fieldErrors['general'] = 'Invalid email or password';
            } else {
              fieldErrors[key] = value[0];
            }
          }
        });
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          setErrors({ general: 'Invalid email or password' });
        }
      } else {
        setErrors({ general: 'Invalid email or password' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = 'email profile';
    const responseType = 'code';

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=${responseType}&access_type=offline&prompt=consent`;

    window.location.href = googleAuthUrl;
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Sign in to your account
        </h1>
        <p className="text-gray-400">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="text-pink-500 hover:text-pink-400 font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-400">{errors.password}</p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="rememberMe"
              id="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-pink-500 focus:ring-2 focus:ring-pink-500 focus:ring-offset-0 cursor-pointer"
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 text-sm text-gray-300 cursor-pointer"
            >
              Remember me
            </label>
          </div>
        </div>

        {/* Sign in button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-950 transition-all shadow-lg shadow-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
        {errors.general && (
          <p className="mt-2 text-sm text-red-400 text-center">{errors.general}</p>
        )}

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-950 text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google OAuth button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 transition-all"
        >
          <GoogleIcon className="w-5 h-5 mr-2" />
          Google
        </button>
      </form>
    </div>
  );
}