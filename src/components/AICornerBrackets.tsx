'use client';

interface Props {
  color?: string;
  size?: number;
  className?: string;
}

export default function AICornerBrackets({ color = 'rgba(200,169,110,0.5)', size = 16, className = '' }: Props) {
  const s = size;
  const corners = [
    { top: 0,    left: 0,   rotate: 0   },
    { top: 0,    right: 0,  rotate: 90  },
    { bottom: 0, right: 0,  rotate: 180 },
    { bottom: 0, left: 0,   rotate: 270 },
  ];

  return (
    <>
      {corners.map((style, i) => {
        const { rotate, ...pos } = style;
        return (
          <div
            key={i}
            className={`absolute pointer-events-none ${className}`}
            style={{ ...pos, width: s, height: s, transform: `rotate(${rotate}deg)` }}
          >
            <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
              <path d="M0 6 L0 0 L6 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        );
      })}
    </>
  );
}
