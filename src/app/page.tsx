import UploadZone from '@/components/UploadZone';
import SampleHouses from '@/components/SampleHouses';

const FEATURES = [
  { icon: '⚡', title: 'Real-time preview', desc: 'Zie direct het effect van elke kleurkeuze' },
  { icon: '🎨', title: '30+ materialen', desc: 'Dak, gevel, ramen en deur volledig aanpasbaar' },
  { icon: '✨', title: 'AI-gegenereerd', desc: 'Fotorealistische resultaten in seconden' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg flex flex-col relative overflow-hidden">

      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-64 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-48 w-[500px] h-[500px] bg-accent/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/3 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-black text-xs font-bold">HC</span>
          </div>
          <span className="text-white font-medium text-sm">House Configurator</span>
        </div>
        <span className="text-gray-600 text-xs border border-white/10 px-3 py-1 rounded-full">
          Beta
        </span>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-8 pb-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent text-xs font-medium px-4 py-2 rounded-full mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            AI-powered renovatie visualizer
          </div>

          <h1 className="text-5xl md:text-7xl font-light text-white leading-[1.05] mb-6 animate-slide-up">
            Jouw woning.<br />
            <span className="text-gradient font-semibold">Opnieuw ontworpen.</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl font-light max-w-xl mx-auto animate-slide-up animate-delay-100">
            Upload een foto van je woning en visualiseer nieuwe kleuren voor dak,
            gevel, ramen en deur — gegenereerd door AI.
          </p>
        </div>

        {/* Upload card */}
        <div className="w-full max-w-2xl animate-slide-up animate-delay-200">
          <div className="glass rounded-3xl p-8 shadow-2xl">
            <UploadZone />

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-gray-700 text-xs font-medium uppercase tracking-widest">of kies een voorbeeld</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            <SampleHouses />
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-10 animate-fade-in animate-delay-300">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex items-center gap-2.5 bg-surface-elevated border border-surface-border px-4 py-2.5 rounded-2xl"
            >
              <span className="text-base">{f.icon}</span>
              <div>
                <p className="text-white text-xs font-medium">{f.title}</p>
                <p className="text-gray-600 text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom bar */}
      <div className="relative z-10 text-center pb-6">
        <p className="text-gray-700 text-xs">
          Geen account nodig · Gratis te proberen
        </p>
      </div>
    </main>
  );
}
