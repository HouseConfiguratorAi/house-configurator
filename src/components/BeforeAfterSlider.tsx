'use client';

import { useRef, useState, useCallback } from 'react';

interface Props {
  before: string;
  after: string;
}

export default function BeforeAfterSlider({ before, after }: Props) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
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

  const onTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    updatePosition(e.touches[0].clientX);
  };

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => { if (isDragging.current) updatePosition(e.touches[0].clientX); },
    [updatePosition]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-2xl overflow-hidden cursor-col-resize select-none"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onMouseUp}
    >
      {/* After image (full) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={after} alt="Na renovatie" className="absolute inset-0 w-full h-full object-cover" draggable={false} />

      {/* Before image (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={before}
          alt="Voor renovatie"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: `${100 / (position / 100)}%`, maxWidth: 'none' }}
          draggable={false}
        />
      </div>

      {/* Divider */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] z-10"
        style={{ left: `${position}%` }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7 5L3 10L7 15" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 5L17 10L13 15" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
        Voor
      </div>
      <div className="absolute bottom-4 right-4 bg-accent/90 backdrop-blur-sm text-black text-xs font-medium px-3 py-1 rounded-full">
        Na
      </div>
    </div>
  );
}
