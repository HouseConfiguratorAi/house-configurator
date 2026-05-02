'use client';

import { useEffect, useState } from 'react';

const STEPS = [
  { label: 'Woningstructuur vastzetten',   detail: 'Architecturale grenzen bewaard',        ms: 3000  },
  { label: 'Kleuren & materialen toepassen',detail: 'Fotorealistische mapping actief',       ms: 8000  },
  { label: 'Texturen renderen',             detail: 'AI detail enhancement loopt',           ms: 10000 },
  { label: 'Belichting optimaliseren',      detail: 'Licht & schaduw verfijnen',             ms: 6000  },
  { label: 'Kwaliteit controleren',         detail: 'Finaliseren & exporteren',              ms: 3000  },
];

export default function AIGeneratingSteps() {
  const [elapsed, setElapsed]   = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const ms = Date.now() - start;
      setElapsed(ms);

      let cum = 0;
      for (let i = 0; i < STEPS.length; i++) {
        cum += STEPS[i].ms;
        if (ms < cum) { setStepIndex(i); break; }
        if (i === STEPS.length - 1) setStepIndex(i);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const totalMs = STEPS.reduce((a, s) => a + s.ms, 0);
  const pct = Math.min(Math.round((elapsed / totalMs) * 100), 99);

  return (
    <div className="absolute inset-0 rounded-3xl bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-6 animate-fade-in z-10">

      {/* Neural spinner */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border border-accent/10 animate-ping" style={{ animationDuration: '2s' }} />
        <div className="absolute inset-0 rounded-full border border-accent/5 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
        <div className="absolute inset-1 rounded-full border-2 border-white/5" />
        <div className="absolute inset-1 rounded-full border-2 border-accent/0 border-t-accent animate-spin" style={{ animationDuration: '1s' }} />
        <div className="absolute inset-4 rounded-full border border-accent/20 border-t-accent/60 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-accent font-mono text-xs font-bold">{pct}%</span>
        </div>
      </div>

      {/* Steps terminal */}
      <div className="w-72 bg-black/50 border border-white/6 rounded-2xl p-4 font-mono">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
          <span className="text-accent text-xs">AI</span>
          <span className="text-gray-600 text-xs">· render.process</span>
          <div className="ml-auto flex gap-1">
            {[0,1,2].map((i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: `${i*0.2}s` }} />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {STEPS.map((step, i) => {
            const isDone = i < stepIndex;
            const isActive = i === stepIndex;
            return (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="flex-shrink-0 w-3">
                  {isDone   && <span className="text-green-400">✓</span>}
                  {isActive && <span className="text-accent animate-pulse">›</span>}
                  {i > stepIndex && <span className="text-gray-800">·</span>}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={isDone ? 'text-gray-600' : isActive ? 'text-white' : 'text-gray-800'}>
                    {step.label}
                    {isActive && <span className="inline-block w-1.5 h-3 bg-accent ml-1 animate-pulse align-middle" />}
                  </p>
                  {(isDone || isActive) && (
                    <p className="text-gray-700 text-[10px] mt-0.5">{step.detail}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress */}
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="h-px bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300 rounded-full"
              style={{ width: `${pct}%`, boxShadow: '0 0 8px rgba(200,169,110,0.6)' }}
            />
          </div>
        </div>
      </div>

      <p className="text-gray-600 text-xs font-mono">AI genereert je renovatie · even geduld</p>
    </div>
  );
}
