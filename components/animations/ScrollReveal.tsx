'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  animation?:
    | 'fade-up'
    | 'fade-down'
    | 'fade-left'
    | 'fade-right'
    | 'zoom-in'
    | 'zoom-out'
    | 'fade-in'
    | 'slide-up'
    | 'slide-left'
    | 'slide-right'
    | 'bounce-in'
    | 'rotate-in'
    | 'scale-rotate';
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  easing?: 'ease-out' | 'bounce' | 'spring';
}

export const ScrollReveal = ({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 800,
  threshold = 0.1,
  className = '',
  easing = 'ease-out',
}: ScrollRevealProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: '100px',
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [threshold]);

  const easingFunctions = {
    'ease-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
    'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  };

  const animationClasses = {
    'fade-up': {
      initial: 'opacity-0 translate-y-16',
      animate: 'opacity-100 translate-y-0',
    },
    'fade-down': {
      initial: 'opacity-0 -translate-y-16',
      animate: 'opacity-100 translate-y-0',
    },
    'fade-left': {
      initial: 'opacity-0 translate-x-[80px]',
      animate: 'opacity-100 translate-x-0',
    },
    'fade-right': {
      initial: 'opacity-0 -translate-x-[80px]',
      animate: 'opacity-100 translate-x-0',
    },
    'zoom-in': {
      initial: 'opacity-0 scale-90',
      animate: 'opacity-100 scale-100',
    },
    'zoom-out': {
      initial: 'opacity-0 scale-110',
      animate: 'opacity-100 scale-100',
    },
    'fade-in': {
      initial: 'opacity-0',
      animate: 'opacity-100',
    },
    'slide-up': {
      initial: 'opacity-0 translate-y-16',
      animate: 'opacity-100 translate-y-0',
    },
    'slide-left': {
      initial: 'opacity-0 translate-x-[80px]',
      animate: 'opacity-100 translate-x-0',
    },
    'slide-right': {
      initial: 'opacity-0 -translate-x-[80px]',
      animate: 'opacity-100 translate-x-0',
    },
    'bounce-in': {
      initial: 'opacity-0 scale-80',
      animate: 'opacity-100 scale-100',
    },
    'rotate-in': {
      initial: 'opacity-0 rotate-3 scale-95',
      animate: 'opacity-100 rotate-0 scale-100',
    },
    'scale-rotate': {
      initial: 'opacity-0 scale-90 -rotate-3',
      animate: 'opacity-100 scale-100 rotate-0',
    },
  };

  const currentAnimation = animationClasses[animation];

  return (
    <div
      ref={elementRef}
      className={`
        transition-all
        ${currentAnimation.initial}
        ${isVisible ? currentAnimation.animate : ''}
        ${className}
      `}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: easingFunctions[easing],
      }}
    >
      {children}
    </div>
  );
};