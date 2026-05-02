import UploadZone from '@/components/UploadZone';
import SampleHouses from '@/components/SampleHouses';
import AuthButton from '@/components/AuthButton';

const FEATURES = [
  { icon: '🔍', title: 'AI-analyse',     desc: 'Woning automatisch gescand' },
  { icon: '🧱', title: '60+ opties',     desc: 'Kleur, materiaal & stijl' },
  { icon: '🌅', title: 'Sfeer instellen', desc: 'Licht & seizoen keuze' },
  { icon: '📄', title: 'PDF export',     desc: 'Professioneel rapport' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg flex flex-col relative overflow-x-hidden">

      {/* Grid background */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(200,169,110,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,110,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-64 left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/3 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
            <span className="text-black text-xs font-bold font-mono">HC</span>
          </div>
          <div>
            <span className="text-white font-medium text-sm">House Configurator</span>
            <span className="text-accent text-xs font-mono ml-2">AI</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-gray-600 text-xs font-mono">model active</span>
          <span className="text-gray-600 text-xs border border-white/8 px-3 py-1 rounded-full ml-2">Beta</span>
          <AuthButton />
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center px-4 pt-6 pb-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          {/* AI label */}
          <div className="inline-flex items-center gap-2 bg-accent/8 border border-accent/20 text-accent text-xs font-mono px-4 py-2 rounded-full mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            AI · woning · analyse · generatie
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>

          <h1 className="text-5xl md:text-6xl font-light text-white leading-[1.06] mb-5 animate-slide-up">
            Jouw woning.<br />
            <span className="text-gradient font-semibold">Opnieuw ontworpen.</span>
          </h1>

          <p className="text-gray-400 text-lg font-light max-w-lg mx-auto animate-slide-up animate-delay-100">
            Upload een foto. AI analyseert je woning en visualiseert nieuwe kleuren,
            materialen en stijlen in seconden.
          </p>

          {/* Fake terminal line */}
          <div className="mt-5 inline-flex items-center gap-2 bg-black/40 border border-white/6 px-4 py-2 rounded-xl animate-fade-in animate-delay-200">
            <span className="text-green-400 font-mono text-xs">▶</span>
            <span className="text-gray-500 font-mono text-xs">house_configurator</span>
            <span className="text-gray-700 font-mono text-xs">--model sdxl-img2img --mode renovation</span>
            <span className="inline-block w-2 h-3.5 bg-accent/70 animate-pulse" />
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 animate-fade-in animate-delay-200">
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
          <div className="relative glass rounded-3xl p-6 shadow-2xl border border-white/5">
            {/* Corner brackets op de kaart */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-accent/30 rounded-tl-lg pointer-events-none" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-accent/30 rounded-tr-lg pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-accent/30 rounded-bl-lg pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-accent/30 rounded-br-lg pointer-events-none" />

            <UploadZone />

            <div className="flex items-center gap-4 my-5">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-gray-700 text-[11px] font-mono uppercase tracking-widest">of selecteer voorbeeld</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            <SampleHouses />
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-3 mt-8 animate-fade-in animate-delay-300">
          {['📤 Upload', '🔍 Analyse', '🎨 Configureer', '✨ Genereer'].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">{step.split(' ')[0]}</span>
                <span className="text-gray-600 text-[10px] font-mono">{step.split(' ')[1]}</span>
              </div>
              {i < 3 && <div className="w-6 h-px bg-white/10" />}
            </div>
          ))}
        </div>

        <p className="text-gray-700 text-xs mt-6 font-mono animate-fade-in animate-delay-300">
          geen account · gratis · 60+ opties
        </p>
      </section>
    </main>
  );
}
