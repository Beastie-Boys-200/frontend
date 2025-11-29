'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const HeroSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const gridSize = 60;

    type Direction = 'up' | 'down' | 'left' | 'right';
    type Edge = 'top' | 'bottom' | 'left' | 'right';

    interface GlowingLine {
      x: number;
      y: number;
      direction: Direction;
      speed: number;
      opacity: number;
      trail: Array<{ x: number; y: number }>;
      nextTurnDistance: number;
    }

    const glowingLines: GlowingLine[] = [];

    // Create line starting from edge
    const createGlowingLine = () => {
      const edge: Edge = ['top', 'bottom', 'left', 'right'][Math.floor(Math.random() * 4)] as Edge;
      let x = 0, y = 0, direction: Direction;

      switch (edge) {
        case 'top':
          x = Math.floor(Math.random() * (canvas.offsetWidth / gridSize)) * gridSize;
          y = 0;
          direction = 'down';
          break;
        case 'bottom':
          x = Math.floor(Math.random() * (canvas.offsetWidth / gridSize)) * gridSize;
          y = canvas.offsetHeight;
          direction = 'up';
          break;
        case 'left':
          x = 0;
          y = Math.floor(Math.random() * (canvas.offsetHeight / gridSize)) * gridSize;
          direction = 'right';
          break;
        case 'right':
          x = canvas.offsetWidth;
          y = Math.floor(Math.random() * (canvas.offsetHeight / gridSize)) * gridSize;
          direction = 'left';
          break;
      }

      return {
        x,
        y,
        direction,
        speed: 1.5 + Math.random() * 2,
        opacity: 0.4 + Math.random() * 0.6,
        trail: [],
        nextTurnDistance: 100 + Math.random() * 200, // Distance before next turn
      };
    };

    // Add new glowing line periodically
    const addLineInterval = setInterval(() => {
      if (glowingLines.length < 8) { // Increased number of lines
        glowingLines.push(createGlowingLine());
      }
    }, 1500);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Draw static grid
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.1)';
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x < canvas.offsetWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.offsetHeight);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < canvas.offsetHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.offsetWidth, y);
        ctx.stroke();
      }

      // Draw and animate glowing lines
      glowingLines.forEach((line, index) => {
        // Save current position for trail
        line.trail.push({ x: line.x, y: line.y });
        if (line.trail.length > 50) {
          line.trail.shift();
        }

        // Move line
        switch (line.direction) {
          case 'up':
            line.y -= line.speed;
            break;
          case 'down':
            line.y += line.speed;
            break;
          case 'left':
            line.x -= line.speed;
            break;
          case 'right':
            line.x += line.speed;
            break;
        }

        line.nextTurnDistance -= line.speed;

        // Random turn at grid intersections
        if (line.nextTurnDistance <= 0 && Math.random() > 0.5) {
          // Snap to grid
          line.x = Math.round(line.x / gridSize) * gridSize;
          line.y = Math.round(line.y / gridSize) * gridSize;

          // Choose perpendicular direction
          const possibleDirections: Direction[] = [];
          if (line.direction === 'up' || line.direction === 'down') {
            possibleDirections.push('left', 'right');
          } else {
            possibleDirections.push('up', 'down');
          }

          // Random turn
          line.direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
          line.nextTurnDistance = 100 + Math.random() * 200;
        }

        // Remove if out of bounds
        if (
          line.x < -50 || line.x > canvas.offsetWidth + 50 ||
          line.y < -50 || line.y > canvas.offsetHeight + 50
        ) {
          glowingLines.splice(index, 1);
          return;
        }

        // Draw trail with fading effect
        for (let i = 0; i < line.trail.length - 1; i++) {
          const fadeAmount = i / line.trail.length;
          const p1 = line.trail[i];
          const p2 = line.trail[i + 1];

          ctx.strokeStyle = `rgba(236, 72, 153, ${line.opacity * fadeAmount * 0.5})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }

        // Draw current position with glow
        ctx.strokeStyle = `rgba(236, 72, 153, ${line.opacity})`;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(236, 72, 153, 0.8)';

        if (line.trail.length > 0) {
          const lastPoint = line.trail[line.trail.length - 1];
          ctx.beginPath();
          ctx.moveTo(lastPoint.x, lastPoint.y);
          ctx.lineTo(line.x, line.y);
          ctx.stroke();
        }

        ctx.shadowBlur = 0;

        // Draw bright point at current position
        ctx.fillStyle = `rgba(236, 72, 153, ${line.opacity})`;
        ctx.beginPath();
        ctx.arc(line.x, line.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      clearInterval(addLineInterval);
    };
  }, []);

  return (
    <section className="relative min-h-screen bg-gray-950 overflow-hidden">
      {/* Animated Grid Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center min-h-[80vh]">
          {/* Left Side - Main Heading and Buttons */}
          <div className="space-y-8 md:space-y-12 flex flex-col items-center">
            {/* HACKATON 2025 Block */}
            <div className="relative inline-block">
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight relative">
                HACKATON
              </h1>
              <div className="relative mt-1 md:mt-2" style={{ marginLeft: '50%' }}>
                <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 bg-clip-text text-transparent animate-pulse relative">
                  2025
                </h2>
                {/* Neon glow effect behind 2025 */}
                <div className="absolute inset-0 text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-pink-500 blur-xl opacity-50">
                  2025
                </div>
              </div>
            </div>

            {/* Buttons Block */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full px-4 sm:px-0">
              <Link
                href="/guide"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 transform hover:scale-105 text-center"
              >
                Chat Bot
              </Link>
              <Link
                href="/login"
                className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-pink-500 text-pink-500 rounded-lg font-semibold hover:bg-pink-500/10 transition-all transform hover:scale-105 text-center"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Right Side - Description & Image */}
          <div className="space-y-6">
            <div className="relative group" suppressHydrationWarning>
              {/* Image with neon border glow */}
              <div className="relative rounded-2xl overflow-hidden">
                {/* Neon border effect */}
                <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 animate-pulse">
                  <div className="w-full h-full bg-gray-950 rounded-2xl"></div>
                </div>

                {/* Image container */}
                <div className="relative rounded-2xl overflow-hidden m-[2px]">
                  <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-purple-500/20 mix-blend-overlay"></div>
                  <Image
                    src="/telekom-preview.jpg"
                    alt="Telecom Preview"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                    priority
                  />
                </div>
              </div>

              {/* Multiple glow layers for neon effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur-lg opacity-40 -z-10 group-hover:opacity-60 transition-opacity"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur-2xl opacity-20 -z-20 group-hover:opacity-30 transition-opacity"></div>
            </div>

            {/* Description Text */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-pink-500/20 rounded-xl p-6">
              <p className="text-lg text-gray-300 leading-relaxed">
                Start using our{' '}
                <span className="text-pink-400 font-semibold">convenient</span>,{' '}
                <span className="text-purple-400 font-semibold">modern</span> and{' '}
                <span className="text-pink-400 font-semibold">powerful solution</span> right now.
                Discover unlimited possibilities of modern communications.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-pink-500/10 border border-pink-500/30 rounded-full text-pink-400 text-sm font-medium">
                🚀 Fast & Reliable
              </span>
              <span className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm font-medium">
                🔒 Secure
              </span>
              <span className="px-4 py-2 bg-pink-500/10 border border-pink-500/30 rounded-full text-pink-400 text-sm font-medium">
                ⚡ Powerful
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none"></div>
    </section>
  );
};