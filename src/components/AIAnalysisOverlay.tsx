'use client';

import { useEffect, useState } from 'react';

interface Step {
  label: string;
  result: string;
  ms: number;
}

const STEPS: Step[] = [
  { label: 'Woningstructuur scannen',    result: 'Vrijstaande woning · 2 verdiepingen',  ms: 700  },
  { label: 'Daktype herkennen',          result: 'Schuin zadeldak · Dakpannen',           ms: 600  },
  { label: 'Gevelmateriaal analyseren',  result: 'Pleisterwerk · Mogelijks baksteen',     ms: 800  },
  { label: 'Ramen & deuren detecteren',  result: '6 ramen · 1 voordeur gedetecteerd',     ms: 500  },
  { label: 'Renovatiepotentieel meten',  result: '94% aanpasbaar via AI',                 ms: 400  },
];

interface Props {
  image: string;
  onDone: () => void;
}

export default function AIAnalysisOverlay({ image, onDone }: Props) {
  const [stepIndex, setStepIndex]   = useState(-1);
  const [doneSteps, setDoneSteps]   = useState<number[]>([]);
  const [scanY, setScanY]           = useState(0);
  const [finished, setFinished]     = useState(false);

  // Scan line animation
  useEffect(() => {
    let y = 0;
    const t = setInterval(() => {
      y = (y + 1.2) % 100;
      setScanY(y);
    }, 16);
    return () => clearInterval(t);
  }, []);

  // Step-by-step reveal
  useEffect(() => {
    let delay = 600;
    STEPS.forEach((step, i) => {
      setTimeout(() => setStepIndex(i), delay);
      delay += step.ms;
      setTimeout(() => setDoneSteps((d) => [...d, i]), delay - 80);
    });
    setTimeout(() => setFinished(true), delay + 400);
    setTimeout(() => onDone(), delay + 900);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center animate-fade-in">

      {/* House image with scan effect */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="w-full h-full object-cover" />
        {/* Scan line */}
        <div
          className="absolute left-0 right-0 h-0.5 pointer-events-none"
          style={{
            top: `${scanY}%`,
            background: 'linear-gradient(90deg, transparent 0%, #c8a96e 20%, #fff 50%, #c8a96e 80%, transparent 100%)',
            boxShadow: '0 0 20px 4px rgba(200,169,110,0.4)',
            opacity: 0.8,
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(200,169,110,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,110,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Main panel */}
      <div className="relative z-10 w-full max-w-lg mx-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-10 h-10 flex-shrink-0">
            <div className="absolute inset-0 rounded-full border border-accent/40 animate-ping" style={{ animationDuration: '1.5s' }} />
            <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
              <span className="text-accent text-lg">🏠</span>
            </div>
          </div>
          <div>
            <p className="text-accent text-xs font-mono uppercase tracking-widest">House Configurator AI</p>
            <h2 className="text-white font-semibold text-lg">Woning analyseren…</h2>
          </div>
          <div className="ml-auto flex gap-1">
            {[0,1,2].map((i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
            ))}
          </div>
        </div>

        {/* Terminal block */}
        <div className="bg-black/60 backdrop-blur-xl border border-accent/15 rounded-2xl p-5 font-mono">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            <span className="text-gray-600 text-xs ml-2">analysis.run — house_configurator_ai</span>
          </div>

          <div className="space-y-2.5">
            {STEPS.map((step, i) => {
              const isActive = stepIndex === i && !doneSteps.includes(i);
              const isDone   = doneSteps.includes(i);
              const isPending = stepIndex < i;

              return (
                <div key={i} className="flex items-start gap-3 text-sm">
                  {/* Status icon */}
                  <span className="flex-shrink-0 w-4 mt-0.5">
                    {isDone    && <span className="text-green-400">✓</span>}
                    {isActive  && <span className="text-accent animate-pulse">›</span>}
                    {isPending && <span className="text-gray-700">·</span>}
                  </span>

                  {/* Label */}
                  <span className={`flex-1 ${isDone ? 'text-gray-400' : isActive ? 'text-white' : 'text-gray-700'}`}>
                    {step.label}
                    {isActive && <span className="inline-block w-2 h-3.5 bg-accent/80 ml-1 animate-pulse align-middle" />}
                  </span>

                  {/* Result */}
                  {isDone && (
                    <span className="text-accent text-xs text-right flex-shrink-0">{step.result}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex justify-between text-xs text-gray-600 mb-1.5">
              <span>Analyse voortgang</span>
              <span className="text-accent">{Math.round((doneSteps.length / STEPS.length) * 100)}%</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${(doneSteps.length / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Done state */}
        {finished && (
          <div className="mt-4 text-center animate-fade-in">
            <p className="text-green-400 font-mono text-sm">✓ Analyse compleet — configurator laden…</p>
          </div>
        )}
      </div>
    </div>
  );
}
