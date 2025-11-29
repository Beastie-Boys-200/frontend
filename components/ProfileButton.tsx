'use client';

import { useState } from 'react';
import { ProfileModal } from '@/components/modals/ProfileModal';
import { FaUser } from 'react-icons/fa';

export const ProfileButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Floating button in bottom right corner */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-2xl shadow-pink-500/50 hover:shadow-pink-500/70 hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center group"
        aria-label="Open Profile"
      >
        <FaUser className="text-white text-2xl group-hover:scale-110 transition-transform" />
      </button>

      {/* Profile Modal */}
      <ProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};