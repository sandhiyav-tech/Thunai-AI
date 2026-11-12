'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Language } from '@/lib/types';
import { speakText, stopSpeaking } from '@/lib/speech';

interface AudioPlayerButtonProps {
  textToSpeak: string;
  language: Language;
  label?: string;
  className?: string;
  compact?: boolean;
}

export const AudioPlayerButton: React.FC<AudioPlayerButtonProps> = ({
  textToSpeak,
  language,
  label,
  className = '',
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      // Stop speaking on unmount
      if (isPlaying) {
        stopSpeaking();
      }
    };
  }, [isPlaying]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakText(
        textToSpeak,
        language,
        () => setIsPlaying(true),
        () => setIsPlaying(false),
        () => setIsPlaying(false)
      );
    }
  };

  const defaultLabel = language === 'ta' ? 'கேள்' : 'Listen';

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`inline-flex items-center justify-center p-2 rounded-xl transition-all active:scale-95 min-h-[44px] min-w-[44px] ${
          isPlaying
            ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-2 ring-amber-400'
            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
        } ${className}`}
        aria-label={isPlaying ? 'Stop listening' : 'Listen with voice'}
        title={isPlaying ? 'நிறுத்து (Stop)' : 'ஒலியில் கேள் (Listen)'}
      >
        {isPlaying ? (
          <VolumeX className="w-5 h-5 animate-pulse text-white" />
        ) : (
          <Volume2 className="w-5 h-5 text-emerald-800" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 min-h-[48px] ${
        isPlaying
          ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 ring-2 ring-amber-300'
          : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-800/20'
      } ${className}`}
      aria-label={isPlaying ? 'Stop audio playback' : 'Listen to text'}
    >
      {isPlaying ? (
        <>
          <VolumeX className="w-5 h-5 text-white animate-spin" />
          <span>{language === 'ta' ? 'நிறுத்து' : 'Stop'}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-5 h-5 text-white" />
          <span>{label || defaultLabel}</span>
        </>
      )}
    </button>
  );
};
