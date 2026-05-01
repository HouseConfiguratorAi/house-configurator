'use client';

import { useRouter } from 'next/navigation';
import { useHouseStore } from '@/store/houseStore';

const SAMPLES = [
  {
    id: 'modern',
    label: 'Modern',
    url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
  },
  {
    id: 'classic',
    label: 'Klassiek',
    url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
  },
  {
    id: 'contemporary',
    label: 'Eigentijds',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  },
];

export default function SampleHouses() {
  const router = useRouter();
  const setOriginalImage = useHouseStore((s) => s.setOriginalImage);

  const handleSelect = async (sample: (typeof SAMPLES)[0]) => {
    try {
      const res = await fetch(sample.url);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setOriginalImage(base64, `${sample.id}.jpg`);
        router.push('/configure');
      };
      reader.readAsDataURL(blob);
    } catch {
      alert('Kon voorbeeldafbeelding niet laden. Gebruik eigen upload.');
    }
  };

  return (
    <div>
      <p className="text-gray-500 text-sm text-center mb-4">Of kies een voorbeeldwoning</p>
      <div className="grid grid-cols-3 gap-3">
        {SAMPLES.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSelect(s)}
            className="group relative rounded-xl overflow-hidden aspect-video bg-surface-elevated hover:ring-2 hover:ring-accent transition-all duration-200"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.url}
              alt={s.label}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/40 flex items-end p-2">
              <span className="text-white text-xs font-medium">{s.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
