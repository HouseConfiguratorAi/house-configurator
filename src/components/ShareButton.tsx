'use client';

import { useState } from 'react';

interface Props {
  imageUrl: string;
  title?: string;
}

export default function ShareButton({ imageUrl, title = 'Mijn AI woningrenovatie' }: Props) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const shareText = `Bekijk mijn woningrenovatie gegenereerd met House Configurator AI! 🏠✨`;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: shareUrl });
      } catch { /* dismissed */ }
    } else {
      setOpen(true);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsapp = () =>
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');

  const email = () =>
    window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`, '_blank');

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className="w-full py-3 rounded-xl font-medium text-sm text-white bg-surface-elevated hover:bg-surface-high border border-surface-border transition-all duration-200 flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Delen
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-2 right-0 z-50 glass rounded-2xl p-3 w-52 animate-slide-up shadow-xl border border-white/8">
            <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2 px-1">Deel via</p>
            <div className="space-y-1">
              <button onClick={whatsapp} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-sm text-white transition-colors">
                <span className="text-lg">💬</span> WhatsApp
              </button>
              <button onClick={email} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-sm text-white transition-colors">
                <span className="text-lg">✉️</span> E-mail
              </button>
              <button onClick={copyLink} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-sm text-white transition-colors">
                <span className="text-lg">{copied ? '✅' : '🔗'}</span>
                {copied ? 'Gekopieerd!' : 'Kopieer link'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
