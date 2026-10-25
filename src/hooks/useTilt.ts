import { useRef, useEffect, useState, useCallback } from 'react';

interface TiltOptions {
  max?: number; // max tilt rotation (deg)
  scale?: number; // scale on hover
  speed?: number; // transition speed ms
  perspective?: number; // perspective px
  disabled?: boolean;
}

export function useTilt<T extends HTMLElement>(options: TiltOptions = {}) {
  const {
    max = 8,
    scale = 1.02,
    speed = 400,
    perspective = 1000,
    disabled = false
  } = options;

  const ref = useRef<T>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (disabled || !ref.current) return;
    
    // Check reduced motion preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const elem = ref.current;
    const rect = elem.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -max;
    const rotateY = ((x - centerX) / centerX) * max;

    setStyle({
      transform: `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`,
      transition: 'transform 80ms ease-out',
      transformStyle: 'preserve-3d',
      willChange: 'transform'
    });
  }, [max, scale, perspective, disabled]);

  const handleMouseLeave = useCallback(() => {
    if (disabled) return;
    setStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: `transform ${speed}ms cubic-bezier(0.16, 1, 0.3, 1)`,
      transformStyle: 'preserve-3d'
    });
  }, [speed, perspective, disabled]);

  useEffect(() => {
    const elem = ref.current;
    if (!elem || disabled) return;

    elem.addEventListener('mousemove', handleMouseMove);
    elem.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      elem.removeEventListener('mousemove', handleMouseMove);
      elem.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave, disabled]);

  return { ref, style };
}
