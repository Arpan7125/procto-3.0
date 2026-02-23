import { useEffect, useState } from 'react';

interface GlitchTextProps {
  children: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'div';
}

export default function GlitchText({ children, className = '', as: Tag = 'span' }: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Tag className={`glitch-wrapper ${className}`}>
      <span className="glitch-text" data-text={children} aria-label={children}>
        {children}
      </span>
      {isGlitching && (
        <>
          <span className="glitch-layer glitch-layer-1" aria-hidden="true">{children}</span>
          <span className="glitch-layer glitch-layer-2" aria-hidden="true">{children}</span>
        </>
      )}
    </Tag>
  );
}
