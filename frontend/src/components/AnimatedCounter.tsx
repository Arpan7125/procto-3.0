import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: string;       // e.g. "99.7%", "<50ms", "10K+", "24/7"
  duration?: number;   // ms
}

export default function AnimatedCounter({ value, duration = 2000 }: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState('0');
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);

    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animate = () => {
    // Extract numeric part
    const numericMatch = value.match(/[\d.]+/);
    if (!numericMatch) {
      setDisplay(value);
      return;
    }
    const targetNum = parseFloat(numericMatch[0]);
    const prefix = value.slice(0, value.indexOf(numericMatch[0]));
    const suffix = value.slice(value.indexOf(numericMatch[0]) + numericMatch[0].length);
    const hasDecimal = numericMatch[0].includes('.');
    const decimalPlaces = hasDecimal ? numericMatch[0].split('.')[1].length : 0;

    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = targetNum * eased;

      setDisplay(prefix + current.toFixed(decimalPlaces) + suffix);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  };

  return (
    <div ref={ref} className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500 mb-2">
      {display}
    </div>
  );
}
