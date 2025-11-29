'use client';

import { useEffect, useState, useRef } from 'react';

interface AnimatedBotProps {
  size?: number;
}

export const AnimatedBot = ({ size = 40 }: AnimatedBotProps) => {
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const botRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let isSubscribed = true;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isSubscribed || !botRef.current) return;

      const rect = botRef.current.getBoundingClientRect();
      const botCenterX = rect.left + rect.width / 2;
      const botCenterY = rect.top + rect.height / 2;

      const angle = Math.atan2(e.clientY - botCenterY, e.clientX - botCenterX);
      const distance = Math.min(
        Math.hypot(e.clientX - botCenterX, e.clientY - botCenterY) / 100,
        3
      );

      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      setEyePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      isSubscribed = false;
      window.removeEventListener('mousemove', handleMouseMove);
      // Reset eye position on unmount
      setEyePosition({ x: 0, y: 0 });
    };
  }, []);

  return (
    <svg
      ref={botRef}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-float"
    >
      {/* Antenna */}
      <line
        x1="50"
        y1="10"
        x2="50"
        y2="20"
        stroke="url(#neonGradient)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="50" cy="8" r="3" fill="url(#neonGradient)">
        <animate
          attributeName="opacity"
          values="1;0.5;1"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Head */}
      <rect
        x="25"
        y="20"
        width="50"
        height="45"
        rx="8"
        fill="url(#robotGradient)"
        stroke="url(#neonGradient)"
        strokeWidth="2"
      />

      {/* Eyes */}
      <g id="leftEye">
        <circle cx="38" cy="38" r="6" fill="#ffffff" />
        <circle
          cx={38 + eyePosition.x}
          cy={38 + eyePosition.y}
          r="3"
          fill="#000000"
        />
      </g>
      <g id="rightEye">
        <circle cx="62" cy="38" r="6" fill="#ffffff" />
        <circle
          cx={62 + eyePosition.x}
          cy={38 + eyePosition.y}
          r="3"
          fill="#000000"
        />
      </g>

      {/* Mouth */}
      <path
        d="M 35 52 Q 50 58 65 52"
        stroke="url(#neonGradient)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Body */}
      <rect
        x="30"
        y="65"
        width="40"
        height="25"
        rx="5"
        fill="url(#robotGradient)"
        stroke="url(#neonGradient)"
        strokeWidth="2"
      />

      {/* Chest panel */}
      <rect
        x="42"
        y="72"
        width="16"
        height="12"
        rx="2"
        fill="#1a1a2e"
        opacity="0.5"
      />
      <line
        x1="45"
        y1="78"
        x2="55"
        y2="78"
        stroke="url(#neonGradient)"
        strokeWidth="1"
      >
        <animate
          attributeName="x2"
          values="45;55;45"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </line>

      {/* Arms */}
      <rect
        x="20"
        y="68"
        width="8"
        height="18"
        rx="4"
        fill="url(#robotGradient)"
        stroke="url(#neonGradient)"
        strokeWidth="1.5"
      />
      <rect
        x="72"
        y="68"
        width="8"
        height="18"
        rx="4"
        fill="url(#robotGradient)"
        stroke="url(#neonGradient)"
        strokeWidth="1.5"
      />

      {/* Gradients */}
      <defs>
        <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>

        <linearGradient id="robotGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2d3748" />
          <stop offset="100%" stopColor="#1a202c" />
        </linearGradient>

        <radialGradient id="eyeGlow">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </radialGradient>
      </defs>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </svg>
  );
};