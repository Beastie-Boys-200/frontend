import { ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowIntensity?: 'low' | 'medium' | 'high';
}

export const GlowCard = ({ children, className = '', glowIntensity = 'medium' }: GlowCardProps) => {
  const glowClasses = {
    low: 'opacity-10 group-hover:opacity-20',
    medium: 'opacity-20 group-hover:opacity-30',
    high: 'opacity-40 group-hover:opacity-60',
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Glow effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur-lg ${glowClasses[glowIntensity]} transition-opacity`}></div>

      {/* Card content */}
      <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-pink-500/30 h-full">
        {children}
      </div>
    </div>
  );
};