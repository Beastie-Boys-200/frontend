'use client';

import { useEffect, useRef } from 'react';

export const TrianglesBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Triangle {
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      rotation: number;
      rotationSpeed: number;
    }

    const triangles: Triangle[] = [];
    const triangleCount = 15;

    // Create triangles
    for (let i = 0; i < triangleCount; i++) {
      triangles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 100 + 50,
        speed: Math.random() * 0.5 + 0.3,
        opacity: Math.random() * 0.3 + 0.1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      });
    }

    const drawTriangle = (triangle: Triangle) => {
      ctx.save();
      ctx.translate(triangle.x, triangle.y);
      ctx.rotate(triangle.rotation);

      const gradient = ctx.createLinearGradient(
        -triangle.size / 2,
        -triangle.size / 2,
        triangle.size / 2,
        triangle.size / 2
      );
      gradient.addColorStop(0, `rgba(236, 72, 153, ${triangle.opacity})`);
      gradient.addColorStop(0.5, `rgba(168, 85, 247, ${triangle.opacity})`);
      gradient.addColorStop(1, `rgba(236, 72, 153, ${triangle.opacity})`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -triangle.size / 2);
      ctx.lineTo(-triangle.size / 2, triangle.size / 2);
      ctx.lineTo(triangle.size / 2, triangle.size / 2);
      ctx.closePath();
      ctx.stroke();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      triangles.forEach((triangle) => {
        // Move triangle towards viewer (increase size and move down)
        triangle.size += triangle.speed;
        triangle.y += triangle.speed * 2;
        triangle.rotation += triangle.rotationSpeed;

        // Reset when triangle gets too close
        if (triangle.size > 300 || triangle.y > canvas.height + 200) {
          triangle.size = Math.random() * 50 + 20;
          triangle.y = -100;
          triangle.x = Math.random() * canvas.width;
          triangle.opacity = Math.random() * 0.3 + 0.1;
        }

        drawTriangle(triangle);
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};
