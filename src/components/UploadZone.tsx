'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { useHouseStore } from '@/store/houseStore';

export default function UploadZone() {
  const router = useRouter();
  const setOriginalImage = useHouseStore((s) => s.setOriginalImage);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('Alleen afbeeldingen zijn toegestaan.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Afbeelding mag maximaal 10 MB zijn.');
        return;
      }
      setError('');
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setOriginalImage(base64, file.name);
        router.push('/configure');
      };
      reader.readAsDataURL(file);
    },
    [setOriginalImage, router]
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    multiple: false,
    onDrop: (files) => { setIsDragging(false); if (files[0]) processFile(files[0]); },
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative flex flex-col items-center justify-center
        w-full h-64 rounded-2xl border-2 border-dashed cursor-pointer
        transition-all duration-300
        ${isDragging
          ? 'border-accent bg-accent/10 scale-[1.02]'
          : 'border-white/20 bg-surface-elevated hover:border-accent/60 hover:bg-surface-high'
        }
      `}
    >
      <input {...getInputProps()} />
      <div className="text-5xl mb-4 select-none">📷</div>
      <p className="text-white font-medium text-lg">Sleep je woningfoto hierheen</p>
      <p className="text-gray-500 text-sm mt-1">of klik om een bestand te kiezen</p>
      <p className="text-gray-600 text-xs mt-3">JPG, PNG, WebP — max 10 MB</p>
      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
    </div>
  );
}
