'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { Language } from '@/lib/types';
import { isSpeechRecognitionSupported, startSpeechRecognition } from '@/lib/speech';

interface VoiceButtonProps {
  language: Language;
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
  className?: string;
  size?: 'normal' | 'large';
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  language,
  onTranscript,
  onError,
  className = '',
  size = 'normal',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
  }, []);

  const handleToggle = () => {
    setErrorMessage(null);

    if (isListening) {
      setIsListening(false);
      return;
    }

    if (!supported) {
      const msg =
        language === 'ta'
          ? 'உங்கள் உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை. கீழே உள்ள தட்டச்சுப் பெட்டியைப் பயன்படுத்தவும்.'
          : 'Voice input is not supported in this browser. Please type your message below.';
      setErrorMessage(msg);
      if (onError) onError(msg);
      return;
    }

    setIsListening(true);
    const recognitionLang = language === 'ta' ? 'ta-IN' : 'en-IN';

    const stopFn = startSpeechRecognition(
      (transcript) => {
        setIsListening(false);
        onTranscript(transcript);
      },
      (err) => {
        setIsListening(false);
        setErrorMessage(err);
        if (onError) onError(err);
      },
      () => {
        setIsListening(false);
      },
      recognitionLang
    );

    return () => {
      stopFn();
    };
  };

  const buttonSizeClasses =
    size === 'large'
      ? 'w-16 h-16 sm:w-20 sm:h-20 text-2xl'
      : 'w-12 h-12 sm:w-14 sm:h-14 text-xl';

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={handleToggle}
        className={`relative rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-lg select-none min-h-[48px] min-w-[48px] ${buttonSizeClasses} ${
          isListening
            ? 'bg-amber-600 text-white animate-pulse-mic ring-4 ring-amber-300 shadow-amber-600/40'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/30'
        } ${className}`}
        aria-label={
          isListening
            ? language === 'ta'
              ? 'குரல் பதிவை நிறுத்து'
              : 'Stop voice recording'
            : language === 'ta'
            ? 'பேசி பதிலளிக்கவும்'
            : 'Click to speak'
        }
        title={
          isListening
            ? language === 'ta'
              ? 'கேட்கிறது... பேசவும்'
              : 'Listening... please speak'
            : language === 'ta'
            ? 'குரல் மூலம் பேசுங்கள்'
            : 'Speak via microphone'
        }
      >
        {isListening ? (
          <Mic className="w-7 h-7 sm:w-9 sm:h-9 animate-bounce text-white" />
        ) : (
          <Mic className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        )}
      </button>

      {/* Status label under button */}
      <span className="mt-2 text-xs sm:text-sm font-semibold text-slate-700">
        {isListening ? (
          <span className="text-amber-700 font-bold flex items-center gap-1 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-600 inline-block"></span>
            {language === 'ta' ? 'கேட்கிறது... பேசவும்' : 'Listening... Speak now'}
          </span>
        ) : (
          <span>{language === 'ta' ? 'பேசி பதிலளிக்க' : 'Tap to Speak'}</span>
        )}
      </span>

      {/* Inline friendly error message if mic fails */}
      {errorMessage && (
        <div className="mt-2 max-w-xs text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2 flex items-start gap-1.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

