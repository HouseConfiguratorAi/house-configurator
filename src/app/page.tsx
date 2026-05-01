import UploadZone from '@/components/UploadZone';
import SampleHouses from '@/components/SampleHouses';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Hero */}
      <div className="text-center mb-12 animate-fade-in">
        <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">
          AI Woning Configurator
        </p>
        <h1 className="text-5xl md:text-6xl font-light text-white mb-4 leading-tight">
          Jouw woning,<br />
          <span className="font-semibold">opnieuw ontworpen.</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Upload een foto van je woning en zie in seconden hoe ze eruitziet met
          een nieuwe dak, gevel, ramen of deur.
        </p>
      </div>

      {/* Upload card */}
      <div className="w-full max-w-xl bg-surface rounded-2xl p-6 shadow-2xl animate-slide-up">
        <UploadZone />

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-gray-600 text-xs">of</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <SampleHouses />
      </div>

      {/* Steps */}
      <div className="flex gap-8 mt-12 text-center text-sm text-gray-600 animate-fade-in">
        {['📤 Upload', '🎨 Configureer', '✨ Genereer'].map((step, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-base">{step.split(' ')[0]}</span>
            <span>{step.split(' ')[1]}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
