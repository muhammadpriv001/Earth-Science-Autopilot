'use client';

import React, { useEffect, useState } from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
  /** Optional caption rendered over the bottom of the frame. */
  caption?: string;
}

/**
 * Plain <img> wrapper for NASA GIBS WMS scenes. GIBS occasionally returns a
 * blank tile for a date outside a layer's archive window, so a failed request
 * is replaced with an explicit note instead of a broken-image icon.
 */
export function GibsImage({ src, alt, className, caption }: Props) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1 bg-emerald-50 px-4 text-center text-[11px] font-medium text-emerald-800 ${
          className || ''
        }`}
      >
        <span>Satellite tile unavailable for this date.</span>
        <span className="text-[10px] text-emerald-700/70">
          NASA GIBS may not have processed this composite yet.
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-emerald-950 ${className || ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
      {caption && (
        <span className="absolute inset-x-0 bottom-0 bg-emerald-950/70 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-xs">
          {caption}
        </span>
      )}
    </div>
  );
}
