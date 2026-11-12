'use client';

import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { Language } from '@/lib/types';

interface DisclaimerBannerProps {
  language: Language;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ language }) => {
  return (
    <div
      role="alert"
      className="bg-amber-50 border-y sm:border sm:rounded-2xl border-amber-300 p-3.5 sm:p-4 text-amber-900 shadow-sm"
    >
      <div className="max-w-5xl mx-auto flex items-start gap-3">
        <div className="p-1 rounded-lg bg-amber-200 text-amber-900 shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="text-xs sm:text-sm leading-relaxed">
          <p className="font-semibold text-amber-950 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
            {language === 'ta' ? 'முக்கிய அறிவிப்பு / வழிகாட்டல் மட்டுமே' : 'Official Guidance Disclaimer'}
          </p>
          <p className="mt-0.5 text-amber-900 font-medium">
            {language === 'ta'
              ? 'இங்கு காட்டப்படும் தகவல்கள் பொது வழிகாட்டலுக்கு மட்டுமே. இறுதித் தகுதி மற்றும் விண்ணப்ப நடைமுறைகளை உறுதிசெய்ய உங்கள் அருகிலுள்ள இ-சேவை மையம் (e-Sevai / CSC) அல்லது கிராம நிர்வாக அலுவலர் (VAO) / தாலுகா அலுவலகத்தை அணுகவும்.'
              : 'Information is for guidance only. Please confirm final eligibility and procedures at your local e-Sevai / CSC centre or government Taluk office.'}
          </p>
        </div>
      </div>
    </div>
  );
};

