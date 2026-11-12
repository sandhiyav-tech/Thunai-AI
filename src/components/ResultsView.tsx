'use client';

import React, { useState, useEffect } from 'react';
import { MatchEngineResult, Language } from '@/lib/types';
import { SchemeCard } from './SchemeCard';
import { ProfileSummary } from './ProfileSummary';
import { AudioPlayerButton } from './AudioPlayerButton';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Volume2,
  RotateCcw,
  Loader2,
  Share2,
} from 'lucide-react';

interface ResultsViewProps {
  results: MatchEngineResult;
  language: Language;
  onBackToChat: () => void;
  onResetAll: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  results,
  language,
  onBackToChat,
  onResetAll,
}) => {
  const [activeTab, setActiveTab] = useState<'matched' | 'maybe'>('matched');
  const [explanation, setExplanation] = useState<string>('');
  const [loadingExplain, setLoadingExplain] = useState<boolean>(false);
  const [shared, setShared] = useState(false);

  // Fetch AI explanation on mount or language change
  useEffect(() => {
    let isCancelled = false;

    async function fetchExplanation() {
      if (results.matched.length === 0 && results.maybe.length === 0) return;

      setLoadingExplain(true);
      try {
        const res = await fetch('/api/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            matched: results.matched.length > 0 ? results.matched : results.maybe,
            language,
          }),
        });
        const data = await res.json();
        if (!isCancelled && data.explanation) {
          setExplanation(data.explanation);
        }
      } catch (err) {
        console.error('Failed to load AI explanation:', err);
      } finally {
        if (!isCancelled) setLoadingExplain(false);
      }
    }

    fetchExplanation();

    return () => {
      isCancelled = true;
    };
  }, [results, language]);

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Thunai AI - Tamil Nadu Schemes',
          text: `I found ${results.matched.length} Tamil Nadu welfare schemes I am eligible for on Thunai AI!`,
          url: window.location.href,
        });
        setShared(true);
        setTimeout(() => setShared(false), 3000);
      } catch {
        // user cancelled or share failed
      }
    }
  };

  const currentSchemes = activeTab === 'matched' ? results.matched : results.maybe;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBackToChat}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-bold shadow-xs active:scale-95 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'ta' ? 'விவரங்களை மாற்ற' : 'Edit Profile'}</span>
        </button>

        <div className="flex items-center gap-2">
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-semibold shadow-xs active:scale-95 min-h-[44px]"
            >
              <Share2 className="w-4 h-4" />
              <span>{shared ? (language === 'ta' ? 'பகிரப்பட்டது!' : 'Shared!') : language === 'ta' ? 'பகிர்' : 'Share'}</span>
            </button>
          )}

          <button
            onClick={onResetAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs sm:text-sm font-bold shadow-xs active:scale-95 min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{language === 'ta' ? 'புதிய சோதனை' : 'Start Fresh'}</span>
          </button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <ProfileSummary profile={results.evaluated_profile} language={language} onEdit={onBackToChat} />

      {/* AI Audio Explanation Card */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-800 to-green-900 text-white p-5 sm:p-6 shadow-lg border border-emerald-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-700/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-700 text-emerald-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">
                {language === 'ta' ? 'துணை AI குரல் வழி விளக்கம்' : 'Thunai AI Voice Explanation'}
              </h2>
              <p className="text-xs text-emerald-200">
                {language === 'ta'
                  ? 'எளிய பேச்சுத் தமிழில் தங்களின் தகுதி விவரங்கள்'
                  : 'Plain spoken summary of your matched schemes'}
              </p>
            </div>
          </div>

          {/* Listen Button for AI explanation */}
          {explanation && (
            <AudioPlayerButton
              textToSpeak={explanation}
              language={language}
              label={language === 'ta' ? 'முழு விளக்கத்தை கேள்' : 'Listen to Explanation'}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shrink-0"
            />
          )}
        </div>

        {/* Content of explanation */}
        <div className="mt-4 text-sm sm:text-base leading-relaxed text-emerald-50 whitespace-pre-line font-medium">
          {loadingExplain ? (
            <div className="flex items-center gap-2 py-4 text-emerald-200">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{language === 'ta' ? 'எளிய விளக்கம் தயாராகிறது...' : 'Generating simple explanation...'}</span>
            </div>
          ) : explanation ? (
            explanation
          ) : (
            language === 'ta'
              ? 'உங்கள் விவரங்களின் அடிப்படையில் திட்டங்கள் கீழே பட்டியலிடப்பட்டுள்ளன.'
              : 'Your matching government schemes are listed below.'
          )}
        </div>
      </div>

      {/* Schemes Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('matched')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm sm:text-base transition-all min-h-[48px] ${
            activeTab === 'matched'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-800/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {language === 'ta' ? 'தகுதியானவை' : 'Eligible Schemes'} ({results.matched.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('maybe')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm sm:text-base transition-all min-h-[48px] ${
            activeTab === 'maybe'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>
            {language === 'ta' ? 'சரிபார்க்க வேண்டியவை' : 'Needs Check'} ({results.maybe.length})
          </span>
        </button>
      </div>

      {/* Scheme Cards List */}
      <div className="space-y-4">
        {currentSchemes.length > 0 ? (
          currentSchemes.map((match) => (
            <SchemeCard key={match.scheme.id} match={match} language={language} />
          ))
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <p className="text-base sm:text-lg font-bold text-slate-700">
              {activeTab === 'matched'
                ? language === 'ta'
                  ? 'நேரடியாகப் பொருந்தும் திட்டங்கள் எதுவும் இல்லை.'
                  : 'No directly matching schemes found.'
                : language === 'ta'
                ? 'சரிபார்க்க வேண்டிய திட்டங்கள் எதுவும் இல்லை.'
                : 'No schemes needing confirmation.'}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {language === 'ta'
                ? 'உங்கள் விவரங்களை மாற்ற மேலே உள்ள "விவரங்களை மாற்ற" பொத்தானை அழுத்தவும்.'
                : 'Tap "Edit Profile" above to adjust your answers.'}
            </p>
          </div>
        )}
      </div>

      {/* Helpful Next Steps Box */}
      <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-xs sm:text-sm space-y-2">
        <h4 className="font-bold text-slate-900 flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-emerald-700" />
          {language === 'ta' ? 'அடுத்து என்ன செய்ய வேண்டும்?' : 'What to do next?'}
        </h4>
        <p className="leading-relaxed">
          {language === 'ta'
            ? '1. மேலே உள்ள பட்டியலிலிருந்து உங்களுக்குத் தேவையான ஆவணங்களை (ஆதார், குடும்ப அட்டை போன்றவை) தயார் செய்து கொள்ளுங்கள்.\n2. உங்கள் பகுதி கிராம நிர்வாக அலுவலர் (VAO), வட்டாட்சியர் அலுவலகம் அல்லது இ-சேவை (e-Sevai) மையத்திற்கு அசல் ஆவணங்களுடன் செல்லவும்.\n3. உதவி தேவைப்பட்டால் தமிழக அரசின் இலவச உதவி எண் 1100-ஐ தொடர்பு கொள்ளவும்.'
            : '1. Keep original documents (Aadhaar, Smart Ration Card, Bank Passbook) ready.\n2. Visit your local Village Administrative Officer (VAO), Taluk Office, or e-Sevai / CSC centre.\n3. For state government enquiries, call the CM Helpline toll-free number 1100.'}
        </p>
      </div>
    </div>
  );
};
