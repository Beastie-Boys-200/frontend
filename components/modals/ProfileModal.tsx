'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { FaUser } from 'react-icons/fa';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ViewMode = 'main' | 'edit-name' | 'edit-password';

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { user, refreshUser } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit name form state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');

  // Edit password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.updateProfile(firstName, lastName);
      await refreshUser();
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        setViewMode('main');
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      await api.changePassword(currentPassword, newPassword);
      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setViewMode('main');
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setViewMode('main');
    setError('');
    setSuccess('');
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <>
      {/* Backdrop with blur - full screen under navbar */}
      <div
        className="fixed top-[72px] left-0 right-0 bottom-0 bg-black/60 backdrop-blur-sm z-[60]"
        onClick={handleClose}
      ></div>

      {/* Modal container - scrollable */}
      <div className="fixed top-[72px] left-0 right-0 bottom-0 z-[61] flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
        {/* Modal */}
        <div
          className="relative w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border-2 border-pink-500/30 shadow-2xl shadow-pink-500/20 my-8 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-pink-400 transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Main View */}
        {viewMode === 'main' && (
          <div className="p-8">
            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full blur-lg opacity-50"></div>
                <div className="relative w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center border-2 border-pink-500/50">
                  <FaUser className="text-4xl text-pink-400" />
                </div>
              </div>
            </div>

            {/* Name */}
            <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              {user?.name || 'User'}
            </h2>
            <p className="text-gray-400 text-center mb-8">{user?.email}</p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setFirstName(user?.firstName || '');
                  setLastName(user?.lastName || '');
                  setViewMode('edit-name');
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-pink-500/10 to-purple-600/10 border-2 border-pink-500/30 text-pink-400 rounded-lg font-medium hover:from-pink-500/20 hover:to-purple-600/20 hover:border-pink-500/50 transition-all"
              >
                Edit Name
              </button>
              <button
                onClick={() => setViewMode('edit-password')}
                className="w-full px-6 py-3 bg-gradient-to-r from-pink-500/10 to-purple-600/10 border-2 border-purple-500/30 text-purple-400 rounded-lg font-medium hover:from-pink-500/20 hover:to-purple-600/20 hover:border-purple-500/50 transition-all"
              >
                Change Password
              </button>
            </div>
          </div>
        )}

        {/* Edit Name View */}
        {viewMode === 'edit-name' && (
          <div className="p-8">
            <button
              onClick={() => setViewMode('main')}
              className="flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors mb-6"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>

            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Edit Name
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-950 transition-all shadow-lg shadow-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Edit Password View */}
        {viewMode === 'edit-password' && (
          <div className="p-8">
            <button
              onClick={() => setViewMode('main')}
              className="flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors mb-6"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>

            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Change Password
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-950 transition-all shadow-lg shadow-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>
      </div>
    </>
  );
};