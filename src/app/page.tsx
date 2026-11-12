'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { LandingHero } from '@/components/LandingHero';
import { ChatInterface } from '@/components/ChatInterface';
import { ResultsView } from '@/components/ResultsView';
import { Language, MatchEngineResult, UserProfile } from '@/lib/types';

export default function Home() {
  const [language, setLanguage] = useState<Language>('ta');
  const [viewState, setViewState] = useState<'landing' | 'chat' | 'results'>('landing');
  const [matchResults, setMatchResults] = useState<MatchEngineResult | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({});

  const handleStart = () => {
    setViewState('chat');
  };

  const handleMatchComplete = (results: MatchEngineResult) => {
    setMatchResults(results);
    setUserProfile(results.evaluated_profile);
    setViewState('results');
  };

  const handleBackToChat = () => {
    setViewState('chat');
  };

  const handleResetAll = () => {
    setUserProfile({});
    setMatchResults(null);
    setViewState('landing');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Universal Header with Logo & Language Toggle */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        onReset={handleResetAll}
      />

      {/* Prominent Guidance Disclaimer Banner */}
      <DisclaimerBanner language={language} />

      {/* Main Dynamic View Content */}
      <main className="flex-1">
        {viewState === 'landing' && (
          <LandingHero language={language} onStart={handleStart} />
        )}

        {viewState === 'chat' && (
          <ChatInterface
            language={language}
            onMatchComplete={handleMatchComplete}
            initialProfile={userProfile}
          />
        )}

        {viewState === 'results' && matchResults && (
          <ResultsView
            results={matchResults}
            language={language}
            onBackToChat={handleBackToChat}
            onResetAll={handleResetAll}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="font-bold text-slate-800">
              {language === 'ta' ? 'துணை AI - தமிழ்நாடு' : 'Thunai AI - Tamil Nadu'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {language === 'ta'
                ? 'விவசாயிகள், தொழிலாளர்கள், பெண்கள், மாணவர்கள் மற்றும் முதியோர்களுக்கான எளிய குரல் வழி வழிகாட்டி.'
                : 'A voice-friendly welfare scheme navigator built with Next.js & Google Gemini.'}
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <button
              onClick={handleResetAll}
              className="text-emerald-700 hover:underline font-semibold"
            >
              {language === 'ta' ? 'முகப்பு' : 'Home'}
            </button>
            <span>•</span>
            <span className="text-slate-400">
              {language === 'ta' ? 'அரசு அதிகாரப்பூர்வ தளம் அல்ல' : 'Not an official government site'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
