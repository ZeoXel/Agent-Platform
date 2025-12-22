'use client';

import { useEffect, useRef } from 'react';

interface Color {
  r: number;
  g: number;
  b: number;
}

interface Blob {
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
  colorIndex: number;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors: Color[] = [
      { r: 191, g: 219, b: 254 },
      { r: 147, g: 197, b: 253 },
      { r: 96, g: 165, b: 250 },
      { r: 59, g: 130, b: 246 },
      { r: 37, g: 99, b: 235 },
      { r: 29, g: 78, b: 216 },
    ];

    const blobs: Blob[] = [
      { x: 0.3, y: 0.35, radius: 0.5, speedX: 0.0002, speedY: 0.0002, colorIndex: 0 },
      { x: 0.65, y: 0.3, radius: 0.45, speedX: -0.0002, speedY: 0.0002, colorIndex: 1 },
      { x: 0.5, y: 0.6, radius: 0.5, speedX: 0.0001, speedY: -0.0002, colorIndex: 2 },
      { x: 0.25, y: 0.65, radius: 0.4, speedX: 0.0003, speedY: 0.0001, colorIndex: 3 },
      { x: 0.7, y: 0.55, radius: 0.45, speedX: -0.0002, speedY: -0.0001, colorIndex: 4 },
      { x: 0.5, y: 0.45, radius: 0.35, speedX: 0.0001, speedY: 0.0002, colorIndex: 5 },
    ];

    const animate = () => {
      time += 1;

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      blobs.forEach((blob) => {
        blob.x += blob.speedX;
        blob.y += blob.speedY;

        if (blob.x < 0 || blob.x > 1) blob.speedX *= -1;
        if (blob.y < 0 || blob.y > 1) blob.speedY *= -1;

        blob.x = Math.max(0, Math.min(1, blob.x));
        blob.y = Math.max(0, Math.min(1, blob.y));

        const actualX = blob.x * canvas.width;
        const actualY = blob.y * canvas.height;
        const actualRadius = blob.radius * Math.min(canvas.width, canvas.height);

        const gradient = ctx.createRadialGradient(
          actualX, actualY, 0,
          actualX, actualY, actualRadius
        );

        const color = colors[blob.colorIndex];
        const opacity = 0.5 + Math.sin(time * 0.001 + blob.colorIndex) * 0.15;

        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute inset-0 backdrop-blur-[20px] pointer-events-none" />
    </div>
  );
}
