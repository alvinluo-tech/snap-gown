'use client';
import { useCallback, useState } from 'react';
import imageCompression from 'browser-image-compression';

export function useImageCompression() {
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);

  const compressUtilityImage = useCallback(async (file: File): Promise<File> => {
    if (!file.type.startsWith('image/')) throw new Error('仅支持图片上传');
    setIsCompressing(true); setProgress(0);

    const options = {
      maxSizeMB: 0.95, // 950KB gives ample budget for crystal-clear receipt text
      maxWidthOrHeight: 2048, // 2048px preserves vertical smartphone screenshots perfectly
      useWebWorker: true,
      fileType: 'image/jpeg' as const,
      initialQuality: 0.92, // 92% quality completely avoids JPEG artifacts around small numbers
      maxIteration: 5
    };

    try {
      const compressedBlob = await imageCompression(file, options);
      return new File([compressedBlob], `${crypto.randomUUID()}.jpg`, { type: 'image/jpeg' });
    } finally {
      setIsCompressing(false); setProgress(100);
    }
  }, []);

  return { compressUtilityImage, isCompressing, progress };
}
