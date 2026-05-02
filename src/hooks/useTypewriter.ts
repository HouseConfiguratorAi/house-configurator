'use client';

import { useState, useEffect } from 'react';

export function useTypewriter(text: string, speed = 18, start = true) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (!start) return;
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, start]);

  return displayed;
}
