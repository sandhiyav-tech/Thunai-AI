'use client';

import React from 'react';
import { Language } from '@/lib/types';
import { Volume2, Languages, Sparkles } from 'lucide-react';
import { speakText, stopSpeaking } from '@/lib/speech';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onReset?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  onReset,
}) => {
  const toggleLanguage = () => {
    stopSpeaking();
    onLanguageChange(language === 'ta' ? 'en' : 'ta');
  };

  const handlePlayAppIntro = () => {
    const introTa =
      'வணக்கம்! துணை ஏஐ தளத்திற்கு வரவேற்கிறோம். இது தமிழ்நாட்டில் உள்ள விவசாயிகள், பெண்கள், மாணவர்கள், தொழிலாளர்கள் மற்றும் முதியவர்களுக்கான அரசு நலத்திட்டங்களை எளிதாக கண்டறிய உதவும் குரல் வழி உதவியாளர்.';
    const introEn =
      'Welcome to Thunai AI. A voice-friendly assistant helping people in Tamil Nadu find welfare schemes they are eligible for, required documents, and where to apply.';
    speakText(language === 'ta' ? introTa : introEn, language);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-5xl mx-auto px-4 py-3 sm:px-6 flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <button
          onClick={onReset}
          className="flex items-center gap-3 text-left focus:outline-none group"
          aria-label="Thunai AI Home"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
            <span className="text-xl">து</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-tamil">
                {language === 'ta' ? 'துணை AI' : 'Thunai AI'}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Sparkles className="w-3 h-3 mr-1 text-emerald-600" />
                TN
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {language === 'ta'
                ? 'தமிழ்நாடு அரசு நலத்திட்ட வழிகாட்டி'
                : 'Tamil Nadu Government Schemes Navigator'}
            </p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio Help Button */}
          <button
            onClick={handlePlayAppIntro}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors active:scale-95 min-h-[44px]"
            title={language === 'ta' ? 'அறிமுகக் குரல்' : 'Listen to App Intro'}
            aria-label="Listen to Audio Guide"
          >
            <Volume2 className="w-4 h-4 text-emerald-700 animate-pulse" />
            <span className="hidden md:inline">
              {language === 'ta' ? 'வழிகாட்டி ஒலி' : 'Audio Guide'}
            </span>
          </button>

          {/* Bilingual Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors active:scale-95 min-h-[44px]"
            aria-label={`Switch to ${language === 'ta' ? 'English' : 'Tamil'}`}
          >
            <Languages className="w-4 h-4 text-slate-600" />
            <span>{language === 'ta' ? 'English' : 'தமிழ்'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
