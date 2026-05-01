import UploadZone from '@/components/UploadZone';
import SampleHouses from '@/components/SampleHouses';

const FEATURES = [
  { icon: '🏠', title: '9 woonstijlen', desc: 'Van modern tot mediterraan' },
  { icon: '🎨', title: '60+ kleuren', desc: 'Dak, gevel, ramen & deur' },
  { icon: '⚡', title: '✨ Stijlcombinaties', desc: '6 kant-en-klare presets' },
  { icon: '📸', title: 'Before/After slider', desc: 'Direct vergelijken' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg flex flex-col relative overflow-x-hidden">

      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-64 left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-accent/4 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-48 w-[500px] h-[500px] bg-accent/2 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/2 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
            <span className="text-black text-xs font-bold">HC</span>
          </div>
          <span className="text-white font-medium">House Configurator</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-600 text-xs border border-white/8 px-3 py-1 rounded-full">Beta</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center px-4 pt-6 pb-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent text-xs font-medium px-4 py-2 rounded-full mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            AI-powered renovatie visualizer
          </div>

          <h1 className="text-5xl md:text-6xl font-light text-white leading-[1.06] mb-5 animate-slide-up">
            Jouw woning.<br />
            <span className="text-gradient font-semibold">Opnieuw ontworpen.</span>
          </h1>

          <p className="text-gray-400 text-lg font-light max-w-lg mx-auto animate-slide-up animate-delay-100">
            Upload een foto en visualiseer nieuwe kleuren voor dak, gevel, ramen en deur —
            gegenereerd door AI in seconden.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 animate-fade-in animate-delay-200">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-center gap-2 bg-surface-elevated border border-surface-border px-3.5 py-2 rounded-2xl">
              <span className="text-sm">{f.icon}</span>
              <div>
                <span className="text-white text-xs font-medium">{f.title}</span>
                <span className="text-gray-600 text-xs"> · {f.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Upload card */}
        <div className="w-full max-w-2xl animate-slide-up animate-delay-200">
          <div className="glass rounded-3xl p-6 shadow-2xl border border-white/5">
            <UploadZone />

            <div className="flex items-center gap-4 my-5">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-gray-700 text-[11px] font-medium uppercase tracking-widest">
                of kies een voorbeeldwoning
              </span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            <SampleHouses />
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-gray-700 text-xs mt-8 animate-fade-in animate-delay-300">
          Geen account nodig · Gratis te proberen · 60+ kleuropties
        </p>
      </section>
    </main>
  );
}
