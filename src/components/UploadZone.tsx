'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { useHouseStore } from '@/store/houseStore';
import AIAnalysisOverlay from './AIAnalysisOverlay';

export default function UploadZone() {
  const router = useRouter();
  const setOriginalImage = useHouseStore((s) => s.setOriginalImage);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisImage, setAnalysisImage] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState('');

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) { setError('Alleen afbeeldingen toegestaan.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Maximaal 10 MB.'); return; }
    setError('');
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPendingName(file.name);
      setAnalysisImage(base64);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAnalysisDone = () => {
    if (!analysisImage) return;
    setOriginalImage(analysisImage, pendingName);
    router.push('/configure');
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    multiple: false,
    onDrop: (files) => { setIsDragging(false); if (files[0]) processFile(files[0]); },
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  return (
    <>
      {analysisImage && (
        <AIAnalysisOverlay image={analysisImage} onDone={handleAnalysisDone} />
      )}

      <div
        {...getRootProps()}
        className={`
          relative flex flex-col items-center justify-center w-full py-12 rounded-2xl border-2 border-dashed cursor-pointer
          transition-all duration-300 group
          ${isDragging ? 'border-accent bg-accent/8 scale-[1.02]' : 'border-white/10 hover:border-accent/40 hover:bg-white/[0.02]'}
        `}
      >
        <input {...getInputProps()} />

        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm font-mono">Afbeelding laden…</p>
          </div>
        ) : (
          <>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${isDragging ? 'bg-accent/20 scale-110' : 'bg-surface-elevated group-hover:bg-accent/10'}`}>
              <svg className={`w-6 h-6 transition-colors ${isDragging ? 'text-accent' : 'text-gray-500 group-hover:text-accent'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="text-white font-medium">Sleep je woningfoto hierheen</p>
            <p className="text-gray-500 text-sm mt-1">of <span className="text-accent">klik om te kiezen</span></p>
            <p className="text-gray-700 text-xs mt-3 font-mono">JPG · PNG · WebP · max 10 MB</p>
            {error && <p className="text-red-400 text-xs mt-3 bg-red-400/10 px-3 py-1.5 rounded-lg">{error}</p>}
          </>
        )}
      </div>
    </>
  );
}
