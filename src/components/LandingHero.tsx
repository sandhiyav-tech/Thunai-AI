'use client';

import React from 'react';
import { ArrowRight, Sparkles, Sprout, GraduationCap, HeartHandshake, HardHat, Users } from 'lucide-react';
import { Language } from '@/lib/types';
import { AudioPlayerButton } from './AudioPlayerButton';

interface LandingHeroProps {
  language: Language;
  onStart: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ language, onStart }) => {
  const introAudioTa =
    'வணக்கம்! துணை ஏஐக்கு நல்வரவு. நீங்கள் எந்தெந்த அரசு நலத்திட்டங்களுக்கு தகுதியானவர், என்னென்ன ஆவணங்கள் தேவை, எங்கு விண்ணப்பிக்க வேண்டும் என்பதை எளிதாக அறிந்துகொள்ளுங்கள். உங்கள் விவரங்களை பேசவோ தட்டச்சு செய்யவோ முடியும். தொடங்க கீழே உள்ள தொடங்குங்கள் பொத்தானை அழுத்தவும்.';
  const introAudioEn =
    'Welcome to Thunai AI. Find government welfare schemes you are eligible for, required documents, and where to apply. You can answer using voice or text. Click Start to begin.';

  const categories = [
    {
      icon: Sprout,
      title_ta: 'விவசாயிகள்',
      title_en: 'Farmers',
      desc_ta: 'PM-கிசான், உழவர் பாதுகாப்பு',
      desc_en: 'PM-KISAN, Farmer Welfare',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      icon: HeartHandshake,
      title_ta: 'பெண்கள்',
      title_en: 'Women',
      desc_ta: 'கலைஞர் மகளிர் உரிமைத் திட்டம், திருமண நிதி',
      desc_en: 'KMUT ₹1000/mo, Marriage Aid',
      color: 'bg-rose-50 text-rose-800 border-rose-200',
    },
    {
      icon: GraduationCap,
      title_ta: 'மாணவர்கள்',
      title_en: 'Students',
      desc_ta: 'புதுமைப் பெண், இலவச மடிக்கணினி',
      desc_en: 'Pudhumai Penn, Free Laptop',
      color: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      icon: HardHat,
      title_ta: 'தொழிலாளர்கள்',
      title_en: 'Workers',
      desc_ta: 'கட்டுமான நலவாரியம், விபத்து காப்பீடு',
      desc_en: 'Construction Welfare, Insurance',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      icon: Users,
      title_ta: 'முதியோர் & மாற்றுத்திறனாளி',
      title_en: 'Elderly & Specially Abled',
      desc_ta: 'முதியோர் ஓய்வூதியம், பராமரிப்பு தொகை',
      desc_en: 'Old Age Pension, Monthly Aid',
      color: 'bg-purple-50 text-purple-800 border-purple-200',
    },
  ];

  return (
    <div className="py-6 sm:py-10 max-w-4xl mx-auto px-4">
      {/* Hero Badge */}
      <div className="flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs sm:text-sm font-semibold mb-4">
          <Sparkles className="w-4 h-4 text-emerald-700" />
          <span>
            {language === 'ta'
              ? 'தமிழ்நாடு அரசு நலத்திட்டங்கள் 2024 - 2025'
              : 'Tamil Nadu Public Welfare Navigator 2024 - 2025'}
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {language === 'ta' ? (
            <>
              உங்களுக்கான அரசு நலத்திட்டங்களை <br className="hidden sm:inline" />
              <span className="text-emerald-700 underline decoration-emerald-300 decoration-wavy">
                பேசியே கண்டறியுங்கள்!
              </span>
            </>
          ) : (
            <>
              Discover Tamil Nadu Welfare Schemes <br className="hidden sm:inline" />
              <span className="text-emerald-700 underline decoration-emerald-300 decoration-wavy">
                Simply by Speaking or Typing!
              </span>
            </>
          )}
        </h1>

        {/* Subtitle / Value Proposition */}
        <p className="mt-4 text-base sm:text-xl text-slate-700 max-w-2xl leading-relaxed font-medium">
          {language === 'ta'
            ? 'எந்த ஆவணங்கள் தேவை? எங்கு விண்ணப்பிக்க வேண்டும்? எவ்வளவு நிதி கிடைக்கும்? உங்கள் கிராம நிர்வாக அலுவலர் அல்லது இ-சேவை மையத்திற்குச் செல்லும் முன் உடனே தெரிந்து கொள்ளுங்கள்.'
            : 'Find out which schemes you qualify for, what documents are required, and where to apply. Built for farmers, women, students, workers, and elderly citizens.'}
        </p>

        {/* Audio Listen & Start Call-To-Action */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
          {/* Big Start Button */}
          <button
            onClick={onStart}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-bold text-lg sm:text-xl shadow-xl shadow-emerald-700/25 transition-all transform active:scale-95 border-2 border-emerald-500 min-h-[56px]"
          >
            <span>{language === 'ta' ? 'திட்டங்களைக் கண்டறிய தொடங்கவும்' : 'Start Scheme Check'}</span>
            <ArrowRight className="w-6 h-6" />
          </button>

          {/* Voice Audio Listen Button */}
          <AudioPlayerButton
            textToSpeak={language === 'ta' ? introAudioTa : introAudioEn}
            language={language}
            label={language === 'ta' ? 'அறிமுகக் குரலைக் கேள்' : 'Listen to Intro'}
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white"
          />
        </div>
      </div>

      {/* Target Audiences Grid */}
      <div className="mt-10 sm:mt-14">
        <h2 className="text-center text-sm font-bold tracking-wider text-slate-500 uppercase mb-4">
          {language === 'ta' ? 'யாருக்கெல்லாம் பயனுள்ளது?' : 'Who is this for?'}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border ${cat.color} flex flex-col items-center text-center transition-transform hover:-translate-y-1 shadow-sm`}
              >
                <div className="p-2.5 rounded-xl bg-white shadow-xs mb-2">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm sm:text-base">
                  {language === 'ta' ? cat.title_ta : cat.title_en}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-600 mt-1 line-clamp-2">
                  {language === 'ta' ? cat.desc_ta : cat.desc_en}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Highlights / Privacy Notice */}
      <div className="mt-8 p-4 rounded-2xl bg-white border border-slate-200 text-slate-600 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <span className="font-bold text-slate-800">
            {language === 'ta' ? '🔒 100% பாதுகாப்பானது:' : '🔒 100% Private & Free:'}
          </span>{' '}
          {language === 'ta'
            ? 'எந்தவொரு உள்நுழைவோ (login) அல்லது உங்கள் தனிப்பட்ட தரவுகளோ சேமிக்கப்படுவதில்லை.'
            : 'No login required, no personal data stored on servers.'}
        </div>
        <div className="text-emerald-700 font-semibold">
          {language === 'ta' ? '✓ எளிய பேச்சுத் தமிழ் குரல் ஆதரவு' : '✓ Tamil Voice & Audio Support'}
        </div>
      </div>
    </div>
  );
};

