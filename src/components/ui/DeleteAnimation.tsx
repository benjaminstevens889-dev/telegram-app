'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  angle: number;
  speed: number;
  opacity: number;
  delay: number;
  shape: 'circle' | 'star' | 'diamond' | 'heart';
}

interface DeleteAnimationProps {
  isDeleting: boolean;
  onComplete: () => void;
  children: React.ReactNode;
}

export function DeleteAnimation({ isDeleting, onComplete, children }: DeleteAnimationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showContent, setShowContent] = useState(true);

  const colors = [
    '#f472b6', // pink
    '#a78bfa', // purple
    '#60a5fa', // blue
    '#34d399', // green
    '#fbbf24', // yellow
    '#f87171', // red
    '#818cf8', // indigo
    '#2dd4bf', // teal
  ];

  const shapes: ('circle' | 'star' | 'diamond' | 'heart')[] = ['circle', 'star', 'diamond', 'heart'];

  const generateParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: 50 + (Math.random() - 0.5) * 20,
        y: 50 + (Math.random() - 0.5) * 20,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * 360,
        speed: Math.random() * 100 + 50,
        opacity: 1,
        delay: Math.random() * 0.3,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    return newParticles;
  }, []);

  useEffect(() => {
    if (isDeleting && !isAnimating) {
      setIsAnimating(true);
      setParticles(generateParticles());

      // Hide content after a brief moment
      setTimeout(() => {
        setShowContent(false);
      }, 100);

      // Complete animation after particles disperse
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }, [isDeleting, isAnimating, onComplete, generateParticles]);

  const renderShape = (particle: Particle) => {
    const { shape, size, color, opacity } = particle;

    switch (shape) {
      case 'star':
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={color}
            style={{ opacity }}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      case 'diamond':
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={color}
            style={{ opacity }}
          >
            <path d="M12 2L2 12l10 10 10-10L12 2z" />
          </svg>
        );
      case 'heart':
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={color}
            style={{ opacity }}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        );
      default:
        return (
          <div
            className="rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: color,
              opacity,
              boxShadow: `0 0 ${size}px ${color}`,
            }}
          />
        );
    }
  };

  if (!isAnimating) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-visible">
      {/* Original content with fade effect */}
      <div
        className={`transition-all duration-300 ${
          showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {children}
      </div>

      {/* Particle explosion */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute pointer-events-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            transform: 'translate(-50%, -50%)',
            animation: `particleExplode ${1 + Math.random() * 0.5}s ease-out ${particle.delay}s forwards`,
            '--tx': `${Math.cos(particle.angle * Math.PI / 180) * particle.speed}px`,
            '--ty': `${Math.sin(particle.angle * Math.PI / 180) * particle.speed}px`,
          } as React.CSSProperties}
        >
          {renderShape(particle)}
        </div>
      ))}

      {/* Sparkle effects */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute pointer-events-none"
          style={{
            left: `${30 + Math.random() * 40}%`,
            top: `${30 + Math.random() * 40}%`,
            animation: `sparkle ${0.8 + Math.random() * 0.4}s ease-out ${Math.random() * 0.3}s forwards`,
          }}
        >
          <div
            className="w-1 h-12 bg-gradient-to-b from-white/80 to-transparent rotate-45"
            style={{
              transform: `rotate(${i * 45}deg)`,
            }}
          />
        </div>
      ))}

      <style jsx>{`
        @keyframes particleExplode {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          20% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 1;
          }
          100% {
            transform: translate(
              calc(-50% + var(--tx)),
              calc(-50% + var(--ty))
            ) scale(0);
            opacity: 0;
          }
        }

        @keyframes sparkle {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          30% {
            transform: scale(1) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// Hook to manage delete animation state
export function useDeleteAnimation() {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const startDeleteAnimation = (id: string) => {
    setDeletingIds(prev => new Set(prev).add(id));
  };

  const isDeleting = (id: string) => deletingIds.has(id);

  return { startDeleteAnimation, isDeleting };
}
