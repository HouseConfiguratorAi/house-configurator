'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface Props {
  before: string;
  after: string;
}

export default function BeforeAfterSlider({ before, after }: Props) {
  const [position, setPosition] = useState(50);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(2, Math.min(clientX - rect.left, rect.width - 2));
    setPosition((x / rect.width) * 100);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    updatePosition(e.clientX);
    e.preventDefault();
  };

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => { if (isDragging.current) updatePosition(e.clientX); },
    [updatePosition]
  );

  const onMouseUp = () => { isDragging.current = false; };
  const onTouchStart = (e: React.TouchEvent) => { isDragging.current = true; updatePosition(e.touches[0].clientX); };
  const onTouchMove = useCallback(
    (e: React.TouchEvent) => { if (isDragging.current) updatePosition(e.touches[0].clientX); },
    [updatePosition]
  );

  // Animate in on mount
  useEffect(() => {
    let start = 100;
    const target = 50;
    const step = () => {
      start = start + (target - start) * 0.08;
      setPosition(start);
      if (Math.abs(start - target) > 0.5) requestAnimationFrame(step);
    };
    const timer = setTimeout(() => requestAnimationFrame(step), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-3xl overflow-hidden cursor-col-resize select-none shadow-2xl"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={() => { onMouseUp(); setIsHovered(false); }}
      onMouseEnter={() => setIsHovered(true)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onMouseUp}
    >
      {/* After (full) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={after} alt="Na renovatie" className="absolute inset-0 w-full h-full object-cover" draggable={false} />

      {/* Before (clipped left side) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={before}
          alt="Voor renovatie"
          className="absolute inset-0 h-full object-cover"
          style={{ width: `${10000 / position}%`, maxWidth: 'none' }}
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 z-10 pointer-events-none"
        style={{ left: `${position}%` }}
      >
        <div className="absolute inset-0 w-px bg-white/90 shadow-[0_0_16px_rgba(255,255,255,0.6)]" />

        {/* Handle */}
        <div
          className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-11 h-11 rounded-full bg-white shadow-xl
            flex items-center justify-center
            transition-transform duration-200
            ${isHovered ? 'scale-110' : 'scale-100'}
            pointer-events-auto cursor-col-resize
          `}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M6 4L2 9L6 14" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 4L16 9L12 14" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
        <span className="glass-dark text-white text-xs font-medium px-3 py-1.5 rounded-full">
          Voor
        </span>
      </div>
      <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
        <span className="bg-accent text-black text-xs font-semibold px-3 py-1.5 rounded-full">
          Na
        </span>
      </div>
    </div>
  );
}
