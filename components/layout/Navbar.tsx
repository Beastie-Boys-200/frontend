'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

interface NavbarProps {
  isProfileModalOpen?: boolean;
  setIsProfileModalOpen?: (isOpen: boolean) => void;
}

export const Navbar = ({ isProfileModalOpen, setIsProfileModalOpen }: NavbarProps = {}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  const navItems = [
    {
      name: 'Information',
      href: '#',
      dropdown: [
        { name: 'About Us', href: '/about' },
        { name: 'How It Works', href: '/how-it-works' },
        { name: 'Features', href: '/features' },
      ],
    },
    {
      name: 'Chat Bot',
      href: '/guide',
    },
  ];

  // Toggle dropdown on click
  const toggleDropdown = (itemName: string) => {
    setActiveDropdown(activeDropdown === itemName ? null : itemName);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-pink-500/20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10" suppressHydrationWarning>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-pink-500/30 rounded-lg blur-md group-hover:bg-pink-500/50 transition-all"></div>
              <div className="relative w-full h-full bg-gray-900 rounded-lg p-1.5 border border-pink-500/30 group-hover:border-pink-500/60 transition-all">
                <Image
                  src="/telekom-logo.png"
                  alt="Telecom Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <span className="text-xl font-bold text-white group-hover:text-pink-400 transition-colors">
              Telekom
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-white p-2 hover:text-pink-400 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Navigation Items - Left (Desktop) */}
          <div className="hidden lg:flex items-center gap-8" ref={dropdownRef}>
            {navItems.map((item) => (
              <div
                key={item.name}
                className="relative"
              >
                {item.dropdown ? (
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className="text-gray-300 hover:text-pink-400 transition-colors font-medium flex items-center gap-1"
                  >
                    {item.name}
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${
                        activeDropdown === item.name ? 'rotate-180' : 'rotate-0'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className="text-gray-300 hover:text-pink-400 transition-colors font-medium"
                  >
                    {item.name}
                  </Link>
                )}

                {/* Dropdown with slide animation */}
                {item.dropdown && (
                  <div
                    className={`absolute top-full left-0 mt-2 w-48 bg-gray-900 border border-pink-500/30 rounded-lg shadow-lg shadow-pink-500/10 overflow-hidden transition-all duration-300 origin-top ${
                      activeDropdown === item.name
                        ? 'opacity-100 scale-y-100 pointer-events-auto'
                        : 'opacity-0 scale-y-0 pointer-events-none'
                    }`}
                  >
                    <div className="py-2">
                      {item.dropdown.map((dropItem) => (
                        <Link
                          key={dropItem.name}
                          href={dropItem.href}
                          className="block px-4 py-2 text-gray-300 hover:text-pink-400 hover:bg-pink-500/10 transition-colors"
                          onClick={() => setActiveDropdown(null)}
                        >
                          {dropItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Side Items (Desktop) */}
          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="text-gray-300 font-medium hover:text-pink-400 transition-colors"
                >
                  {user.name}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 rounded-lg font-medium transition-all border-2 border-pink-500 text-pink-500 hover:bg-pink-500/10"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="px-5 py-2 rounded-lg font-medium transition-all bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-lg shadow-pink-500/50"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-2 rounded-lg font-medium transition-all border-2 border-pink-500 text-pink-500 hover:bg-pink-500/10"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? 'max-h-[600px] mt-4' : 'max-h-0'
          }`}
        >
          <div className="py-4 space-y-3 border-t border-pink-500/20">
            {/* Mobile Navigation Items */}
            {navItems.map((item) => (
              <div key={item.name}>
                {item.dropdown ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className="w-full text-left text-gray-300 hover:text-pink-400 transition-colors font-medium flex items-center justify-between py-2"
                    >
                      {item.name}
                      <svg
                        className={`w-4 h-4 transition-transform duration-300 ${
                          activeDropdown === item.name ? 'rotate-180' : 'rotate-0'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        activeDropdown === item.name ? 'max-h-48 mt-2' : 'max-h-0'
                      }`}
                    >
                      <div className="pl-4 space-y-2">
                        {item.dropdown.map((dropItem) => (
                          <Link
                            key={dropItem.name}
                            href={dropItem.href}
                            className="block py-2 text-gray-400 hover:text-pink-400 transition-colors"
                            onClick={() => {
                              setActiveDropdown(null);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            {dropItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="block text-gray-300 hover:text-pink-400 transition-colors font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}

            {/* Mobile Right Items */}
            <div className="pt-4 space-y-3 border-t border-pink-500/20">
              {isAuthenticated && user ? (
                <>
                  <button
                    onClick={() => {
                      setIsProfileModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-center text-gray-300 font-medium py-2 hover:text-pink-400 transition-colors"
                  >
                    {user.name}
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-center px-5 py-2 rounded-lg font-medium transition-all border-2 border-pink-500 text-pink-500 hover:bg-pink-500/10"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="block text-center px-5 py-2 rounded-lg font-medium transition-all bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-lg shadow-pink-500/50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/login"
                    className="block text-center px-5 py-2 rounded-lg font-medium transition-all border-2 border-pink-500 text-pink-500 hover:bg-pink-500/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};