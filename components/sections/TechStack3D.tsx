'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BsLightning } from 'react-icons/bs';

interface Tech {
  name: string;
  logo: string; // Path to logo image
  color: string;
  glowColor: string;
  portId: number; // Which port this tech connects to
}

const technologies: Tech[] = [
  { name: 'React', logo: '/logos/react.png', color: '#61DAFB', glowColor: 'rgba(97, 218, 251, 0.8)', portId: 0 },
  { name: 'Next.js', logo: '/logos/next_js.png', color: '#FFFFFF', glowColor: 'rgba(255, 255, 255, 0.8)', portId: 0 },
  { name: 'Django', logo: '/logos/django-logo.png', color: '#44B78B', glowColor: 'rgba(68, 183, 139, 0.8)', portId: 1 },
  { name: 'FastAPI', logo: '/logos/fastapi.webp', color: '#009688', glowColor: 'rgba(0, 150, 136, 0.8)', portId: 1 },
  { name: 'Three.js', logo: '/logos/three-js-icon.png', color: '#FFFFFF', glowColor: 'rgba(255, 255, 255, 0.8)', portId: 2 },
  { name: 'Docker', logo: '/logos/doceker.png', color: '#2496ED', glowColor: 'rgba(36, 150, 237, 0.8)', portId: 2 },
  { name: 'Docker Compose', logo: '/logos/docker_compose.png', color: '#2496ED', glowColor: 'rgba(36, 150, 237, 0.8)', portId: 3 },
  { name: 'Ollama', logo: '/logos/ollama.png', color: '#FF6B35', glowColor: 'rgba(255, 107, 53, 0.8)', portId: 3 },
  { name: 'PostgreSQL', logo: '/logos/Postgresql_elephant.svg', color: '#336791', glowColor: 'rgba(51, 103, 145, 0.8)', portId: 4 },
  { name: 'Pandas', logo: '/logos/pandas.png', color: '#150458', glowColor: 'rgba(130, 100, 200, 0.8)', portId: 4 },
  { name: 'Neo4j', logo: '/logos/neo4j.png', color: '#008CC1', glowColor: 'rgba(0, 140, 193, 0.8)', portId: 5 },
  { name: 'Tailwind', logo: '/logos/tailwind-css.png', color: '#06B6D4', glowColor: 'rgba(6, 182, 212, 0.8)', portId: 5 },
];

// Port positions on the battery
const ports = [
  { id: 0, x: 20, color: '#61DAFB' },
  { id: 1, x: 35, color: '#44B78B' },
  { id: 2, x: 50, color: '#2496ED' },
  { id: 3, x: 50, color: '#FF6B35' },
  { id: 4, x: 65, color: '#336791' },
  { id: 5, x: 80, color: '#06B6D4' },
];

export default function TechStack3D() {
  const [hoveredTech, setHoveredTech] = useState<Tech | null>(null);
  const [cardPositions, setCardPositions] = useState<Map<string, DOMRect>>(new Map());
  const [portPositions, setPortPositions] = useState<Map<number, { x: number; y: number }>>(new Map());
  const [batteryPosition, setBatteryPosition] = useState<DOMRect | null>(null);
  const [mousePosition, setMousePosition] = useState<Map<string, { x: number; y: number }>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const batteryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePositions = () => {
      const positions = new Map<string, DOMRect>();
      technologies.forEach((tech) => {
        const element = document.getElementById(`tech-${tech.name}`);
        if (element) {
          positions.set(tech.name, element.getBoundingClientRect());
        }
      });
      setCardPositions(positions);

      if (batteryRef.current && containerRef.current) {
        const batteryRect = batteryRef.current.getBoundingClientRect();
        setBatteryPosition(batteryRect);

        const containerRect = containerRef.current.getBoundingClientRect();
        const portPos = new Map<number, { x: number; y: number }>();

        ports.forEach((port) => {
          const portElement = document.getElementById(`port-${port.id}`);
          if (portElement) {
            const portRect = portElement.getBoundingClientRect();
            portPos.set(port.id, {
              x: portRect.left + portRect.width / 2 - containerRect.left,
              y: portRect.top + portRect.height / 2 - containerRect.top,
            });
          }
        });

        setPortPositions(portPos);
      }
    };

    updatePositions();
    const timer = setTimeout(updatePositions, 100);
    const timer2 = setTimeout(updatePositions, 500);
    const timer3 = setTimeout(updatePositions, 1000);

    // Update on scroll and mousemove
    window.addEventListener('scroll', updatePositions, { passive: true });
    window.addEventListener('resize', updatePositions);
    window.addEventListener('mousemove', updatePositions, { passive: true });

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener('scroll', updatePositions);
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('mousemove', updatePositions);
    };
  }, []);

  const getCablePath = (tech: Tech): string => {
    const cardPos = cardPositions.get(tech.name);
    const portPos = portPositions.get(tech.portId);
    
    if (!cardPos || !portPos || !containerRef.current) return '';

    const containerRect = containerRef.current.getBoundingClientRect();
    
    const startX = cardPos.left + cardPos.width / 2 - containerRect.left;
    const startY = cardPos.top + cardPos.height / 2 - containerRect.top;
    
    const endX = portPos.x;
    const endY = portPos.y;
    
    const midY = startY - (startY - endY) * 0.6;
    const controlPoint1X = startX;
    const controlPoint1Y = midY;
    const controlPoint2X = endX;
    const controlPoint2Y = midY - 20;
    
    return `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`;
  };

  const getActivePort = (): number | null => {
    return hoveredTech?.portId ?? null;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[60vh] flex flex-col items-center justify-start pt-2 pb-2 px-4 overflow-hidden"
    >
      {/* SVG layer for cables */}
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%', zIndex: 5 }}
      >
        <defs>
          {technologies.map((tech) => (
            <React.Fragment key={`filter-${tech.name}`}>
              <filter id={`glow-${tech.name}`}>
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              <linearGradient id={`gradient-${tech.name}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: tech.color, stopOpacity: 0 }}>
                  {hoveredTech?.name === tech.name && (
                    <animate
                      attributeName="stop-opacity"
                      values="0;1;0"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  )}
                </stop>
                <stop offset="50%" style={{ stopColor: tech.color, stopOpacity: hoveredTech?.name === tech.name ? 1 : 0 }}>
                  {hoveredTech?.name === tech.name && (
                    <animate
                      attributeName="stop-opacity"
                      values="0;1;0"
                      dur="1.5s"
                      repeatCount="indefinite"
                      begin="0.3s"
                    />
                  )}
                </stop>
                <stop offset="100%" style={{ stopColor: tech.color, stopOpacity: hoveredTech?.name === tech.name ? 1 : 0 }}>
                  {hoveredTech?.name === tech.name && (
                    <animate
                      attributeName="stop-opacity"
                      values="0;1;0"
                      dur="1.5s"
                      repeatCount="indefinite"
                      begin="0.6s"
                    />
                  )}
                </stop>
              </linearGradient>
            </React.Fragment>
          ))}
        </defs>
        
        {/* Draw cables - static */}
        {technologies.map((tech) => {
          const path = getCablePath(tech);
          const isActive = hoveredTech?.name === tech.name;

          return (
            <g key={`cable-${tech.name}`}>
              <path
                d={path}
                fill="none"
                stroke={isActive ? tech.color : '#4B5563'}
                strokeWidth={isActive ? '3' : '2'}
                strokeOpacity={isActive ? '0.8' : '0.4'}
                filter={isActive ? `url(#glow-${tech.name})` : 'none'}
              />

              {isActive && (
                <>
                  <path
                    d={path}
                    fill="none"
                    stroke={`url(#gradient-${tech.name})`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    filter={`url(#glow-${tech.name})`}
                  />

                  <circle r="4" fill={tech.color} filter={`url(#glow-${tech.name})`}>
                    <animateMotion
                      dur="2s"
                      repeatCount="indefinite"
                      path={path}
                    />
                  </circle>
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Battery/Circuit Board */}
      <div className="relative z-10 mb-12 mt-4" ref={batteryRef}>
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div
              className="relative w-56 h-28 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl transition-all duration-500"
              style={{
                boxShadow: hoveredTech
                  ? `0 0 30px ${hoveredTech.glowColor}, inset 0 0 20px ${hoveredTech.glowColor}, 0 0 0 2px ${hoveredTech.color}`
                  : '0 0 10px rgba(75, 85, 99, 0.5)',
              }}
            >
              {/* Circuit lines */}
              <div className="absolute inset-0 opacity-30 transition-all duration-500">
                <div
                  className="absolute top-1/4 left-0 right-0 h-0.5 transition-all duration-500"
                  style={{
                    background: hoveredTech
                      ? `linear-gradient(to right, transparent, ${hoveredTech.color}, transparent)`
                      : 'linear-gradient(to right, transparent, rgb(236 72 153), transparent)'
                  }}
                ></div>
                <div
                  className="absolute top-2/4 left-0 right-0 h-0.5 transition-all duration-500"
                  style={{
                    background: hoveredTech
                      ? `linear-gradient(to right, transparent, ${hoveredTech.color}, transparent)`
                      : 'linear-gradient(to right, transparent, rgb(168 85 247), transparent)'
                  }}
                ></div>
                <div
                  className="absolute top-3/4 left-0 right-0 h-0.5 transition-all duration-500"
                  style={{
                    background: hoveredTech
                      ? `linear-gradient(to right, transparent, ${hoveredTech.color}, transparent)`
                      : 'linear-gradient(to right, transparent, rgb(236 72 153), transparent)'
                  }}
                ></div>
                <div
                  className="absolute left-1/4 top-0 bottom-0 w-0.5 transition-all duration-500"
                  style={{
                    background: hoveredTech
                      ? `linear-gradient(to bottom, transparent, ${hoveredTech.color}, transparent)`
                      : 'linear-gradient(to bottom, transparent, rgb(168 85 247), transparent)'
                  }}
                ></div>
                <div
                  className="absolute left-2/4 top-0 bottom-0 w-0.5 transition-all duration-500"
                  style={{
                    background: hoveredTech
                      ? `linear-gradient(to bottom, transparent, ${hoveredTech.color}, transparent)`
                      : 'linear-gradient(to bottom, transparent, rgb(236 72 153), transparent)'
                  }}
                ></div>
                <div
                  className="absolute left-3/4 top-0 bottom-0 w-0.5 transition-all duration-500"
                  style={{
                    background: hoveredTech
                      ? `linear-gradient(to bottom, transparent, ${hoveredTech.color}, transparent)`
                      : 'linear-gradient(to bottom, transparent, rgb(168 85 247), transparent)'
                  }}
                ></div>
              </div>

              {/* Cable ports at bottom - visible connectors */}
              <div className="absolute -bottom-6 left-0 right-0 flex justify-around px-4">
                {ports.map((port) => {
                  const isPortActive = getActivePort() === port.id;
                  const activeTech = technologies.find(t => t.portId === port.id && hoveredTech?.name === t.name);

                  return (
                    <div key={port.id} className="flex flex-col items-center gap-1">
                      {/* Port connector - rectangular shape */}
                      <div
                        id={`port-${port.id}`}
                        className="relative transition-all duration-500"
                        style={{
                          width: '20px',
                          height: '12px',
                        }}
                      >
                        {/* Outer port housing */}
                        <div
                          className="absolute inset-0 rounded-md transition-all duration-500"
                          style={{
                            background: isPortActive && activeTech
                              ? `linear-gradient(to bottom, ${activeTech.color}, rgba(0,0,0,0.8))`
                              : 'linear-gradient(to bottom, #4B5563, #1F2937)',
                            border: isPortActive
                              ? `1px solid ${activeTech?.color || '#6B7280'}`
                              : '1px solid #374151',
                            boxShadow: isPortActive && activeTech
                              ? `0 0 15px ${activeTech.glowColor}, inset 0 1px 2px rgba(255,255,255,0.2)`
                              : 'inset 0 1px 2px rgba(255,255,255,0.1)',
                          }}
                        >
                          {/* Inner connector pins */}
                          <div className="absolute inset-1 flex justify-around items-center px-0.5">
                            <div
                              className="w-0.5 h-full rounded-full"
                              style={{
                                backgroundColor: isPortActive && activeTech ? activeTech.color : '#6B7280'
                              }}
                            ></div>
                            <div
                              className="w-0.5 h-full rounded-full"
                              style={{
                                backgroundColor: isPortActive && activeTech ? activeTech.color : '#6B7280'
                              }}
                            ></div>
                            <div
                              className="w-0.5 h-full rounded-full"
                              style={{
                                backgroundColor: isPortActive && activeTech ? activeTech.color : '#6B7280'
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Port glow effect */}
                        {isPortActive && activeTech && (
                          <div
                            className="absolute -inset-1 rounded-md animate-pulse"
                            style={{
                              backgroundColor: activeTech.color,
                              opacity: 0.3,
                              filter: 'blur(4px)',
                            }}
                          ></div>
                        )}
                      </div>

                      {/* Port base/mount */}
                      <div
                        className="w-6 h-1.5 rounded-b-md transition-all duration-500"
                        style={{
                          background: isPortActive && activeTech
                            ? `linear-gradient(to bottom, rgba(0,0,0,0.6), ${activeTech.color}30)`
                            : 'linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(75, 85, 99, 0.3))',
                          borderLeft: '1px solid rgba(75, 85, 99, 0.5)',
                          borderRight: '1px solid rgba(75, 85, 99, 0.5)',
                          borderBottom: '1px solid rgba(75, 85, 99, 0.5)',
                        }}
                      ></div>
                    </div>
                  );
                })}
              </div>

              {/* Central lightning bolt */}
              <div className="absolute inset-0 flex items-center justify-center">
                <BsLightning
                  className="transition-all duration-500"
                  size={60}
                  style={{
                    color: hoveredTech ? hoveredTech.color : '#ec4899',
                    filter: hoveredTech
                      ? `drop-shadow(0 0 20px ${hoveredTech.glowColor}) drop-shadow(0 0 40px ${hoveredTech.glowColor})`
                      : 'drop-shadow(0 0 10px rgba(236, 72, 153, 0.6)) drop-shadow(0 0 20px rgba(236, 72, 153, 0.4))',
                    transform: hoveredTech ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              </div>

              {hoveredTech && (
                <>
                  <div 
                    className="absolute inset-0 rounded-xl animate-ping"
                    style={{
                      border: `2px solid ${hoveredTech.color}`,
                      opacity: 0.4,
                    }}
                  ></div>
                  
                  <div 
                    className="absolute -inset-1 rounded-xl blur-md animate-pulse"
                    style={{
                      background: `linear-gradient(45deg, ${hoveredTech.color}, transparent, ${hoveredTech.color})`,
                      opacity: 0.3,
                    }}
                  ></div>
                </>
              )}
            </div>
          </div>
          
          <h3 
            className="text-lg font-medium tracking-wide transition-colors duration-500"
            style={{ color: hoveredTech ? hoveredTech.color : '#D1D5DB' }}
          >
            Powered By
          </h3>
        </div>
      </div>

      {/* Technologies Grid */}
      <div className="relative z-10 w-full max-w-6xl px-6">
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: 'repeat(6, 120px)',
            justifyContent: 'center',
            perspective: '1000px',
          }}
        >
          {technologies.map((tech) => {
            const isHovered = hoveredTech?.name === tech.name;
            const mousePos = mousePosition.get(tech.name) || { x: 0.5, y: 0.5 };

            // Calculate tilt based on mouse position
            const rotateY = isHovered ? (mousePos.x - 0.5) * 30 : 0; // -15 to 15 degrees
            const rotateX = isHovered ? (0.5 - mousePos.y) * 30 : 0; // -15 to 15 degrees

            return (
              <div
                key={tech.name}
                id={`tech-${tech.name}`}
                onMouseEnter={() => setHoveredTech(tech)}
                onMouseLeave={() => {
                  setHoveredTech(null);
                  // Reset mouse position
                  const newPos = new Map(mousePosition);
                  newPos.delete(tech.name);
                  setMousePosition(newPos);
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / rect.width;
                  const y = (e.clientY - rect.top) / rect.height;
                  const newPos = new Map(mousePosition);
                  newPos.set(tech.name, { x, y });
                  setMousePosition(newPos);
                }}
                className="relative w-28 h-28 group cursor-pointer"
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '1000px',
                }}
              >
                {/* 3D Glow effect - only on hover */}
                {isHovered && (
                  <div
                    className="absolute -inset-3 rounded-2xl blur-2xl transition-all duration-500 animate-pulse"
                    style={{
                      backgroundColor: tech.glowColor,
                      transform: 'translateZ(-20px)'
                    }}
                  ></div>
                )}

                {/* 3D Card - Rounded Square */}
                <div
                  className="relative w-full h-full backdrop-blur-sm rounded-xl border-2 flex items-center justify-center p-4"
                  style={{
                    background: isHovered
                      ? 'linear-gradient(to bottom right, rgba(31, 41, 55, 0.95), rgba(17, 24, 39, 0.95), rgba(0, 0, 0, 0.95))'
                      : 'linear-gradient(to bottom right, rgba(31, 41, 55, 0.4), rgba(17, 24, 39, 0.5))',
                    borderColor: isHovered ? tech.color : 'rgba(156, 163, 175, 0.2)',
                    transform: isHovered
                      ? `translateZ(30px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.15)`
                      : 'translateZ(0px) rotateX(0deg) rotateY(0deg) scale(1)',
                    boxShadow: isHovered
                      ? `0 20px 60px ${tech.glowColor}, inset 0 0 30px ${tech.glowColor}, 0 0 0 1px ${tech.color}`
                      : '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.05)',
                    transformStyle: 'preserve-3d',
                    transition: isHovered ? 'all 0.1s ease-out' : 'all 0.5s ease-out',
                  }}
                >
                  {/* Inner shadow for depth - only on hover */}
                  {isHovered && (
                    <div
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, ${tech.glowColor} 0%, transparent 50%, rgba(0,0,0,0.5) 100%)`,
                        transform: 'translateZ(-1px)'
                      }}
                    ></div>
                  )}

                  <img
                    src={tech.logo}
                    alt={tech.name}
                    className="w-full h-full object-contain transition-all duration-300"
                    style={{
                      transform: isHovered ? 'translateZ(20px)' : 'translateZ(0px)',
                      filter: isHovered ? `drop-shadow(0 0 10px ${tech.color})` : 'none',
                      opacity: isHovered ? 1 : 0.9,
                    }}
                    onError={(e) => {
                      console.error(`Failed to load image: ${tech.logo}`);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
