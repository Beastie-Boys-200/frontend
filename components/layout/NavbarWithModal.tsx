'use client';

import { useState } from 'react';
import { Navbar } from './Navbar';
import { ProfileModal } from '@/components/modals/ProfileModal';

export const NavbarWithModal = () => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <>
      <Navbar
        isProfileModalOpen={isProfileModalOpen}
        setIsProfileModalOpen={setIsProfileModalOpen}
      />

      {/* Profile Modal - outside navbar */}
      {isProfileModalOpen && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </>
  );
};