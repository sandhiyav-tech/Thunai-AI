'use client';

import React from 'react';
import { UserProfile, Language } from '@/lib/types';
import { User, MapPin, IndianRupee, Briefcase, Trees, HeartPulse, Edit2 } from 'lucide-react';

interface ProfileSummaryProps {
  profile: UserProfile;
  language: Language;
  onEdit?: () => void;
  compact?: boolean;
}

export const ProfileSummary: React.FC<ProfileSummaryProps> = ({
  profile,
  language,
  onEdit,
  compact = false,
}) => {
  const genderLabels: Record<string, { en: string; ta: string }> = {
    female: { en: 'Female / Woman', ta: 'பெண்' },
    male: { en: 'Male / Man', ta: 'ஆண்' },
    transgender: { en: 'Transgender', ta: 'திருநங்கை' },
    other: { en: 'Other', ta: 'மற்றவை' },
  };

  const occupationLabels: Record<string, { en: string; ta: string }> = {
    farmer: { en: 'Farmer', ta: 'விவசாயி' },
    student: { en: 'Student', ta: 'மாணவர்' },
    worker: { en: 'Worker / Labourer', ta: 'தொழிலாளி / கூலி' },
    homemaker: { en: 'Homemaker', ta: 'இல்லத்தரசி' },
    elderly: { en: 'Senior Citizen', ta: 'முதியவர்' },
    unemployed: { en: 'Unemployed', ta: 'வேலையில்லாதவர்' },
    other: { en: 'Other', ta: 'மற்றவை' },
  };

  const items: { icon: React.ElementType; label_ta: string; label_en: string; value: string }[] = [];

  if (profile.age) {
    items.push({
      icon: User,
      label_ta: 'வயது',
      label_en: 'Age',
      value: `${profile.age} ${language === 'ta' ? 'ஆண்டுகள்' : 'yrs'}`,
    });
  }

  if (profile.gender) {
    items.push({
      icon: User,
      label_ta: 'பாலினம்',
      label_en: 'Gender',
      value: language === 'ta' ? genderLabels[profile.gender]?.ta || profile.gender : genderLabels[profile.gender]?.en || profile.gender,
    });
  }

  if (profile.occupation) {
    items.push({
      icon: Briefcase,
      label_ta: 'தொழில்',
      label_en: 'Occupation',
      value: language === 'ta' ? occupationLabels[profile.occupation]?.ta || profile.occupation : occupationLabels[profile.occupation]?.en || profile.occupation,
    });
  }

  if (profile.annual_income !== undefined && profile.annual_income !== null) {
    items.push({
      icon: IndianRupee,
      label_ta: 'ஆண்டு வருமானம்',
      label_en: 'Annual Income',
      value: `₹${profile.annual_income.toLocaleString('en-IN')}`,
    });
  }

  if (profile.district) {
    items.push({
      icon: MapPin,
      label_ta: 'மாவட்டம்',
      label_en: 'District',
      value: profile.district,
    });
  }

  if (profile.has_land !== undefined && profile.has_land !== null) {
    items.push({
      icon: Trees,
      label_ta: 'நிலம்',
      label_en: 'Land',
      value: profile.has_land
        ? `${profile.land_acres ?? 'ஆம்'} ${language === 'ta' ? 'ஏக்கர்' : 'acres'}`
        : language === 'ta' ? 'இல்லை' : 'None',
    });
  }

  if (profile.is_differently_abled) {
    items.push({
      icon: HeartPulse,
      label_ta: 'மாற்றுத்திறனாளி',
      label_en: 'Differently Abled',
      value: language === 'ta' ? 'ஆம் (மாற்றுத்திறன் உடையவர்)' : 'Yes',
    });
  }

  if (items.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5 items-center">
        {items.map((item, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200"
          >
            <item.icon className="w-3 h-3 text-emerald-700" />
            <span className="text-emerald-700 font-medium">{language === 'ta' ? item.label_ta : item.label_en}:</span>
            <span>{item.value}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-700" />
          {language === 'ta' ? 'உங்கள் பதிவு விவரங்கள்' : 'Your Profile Summary'}
        </h3>
        {onEdit && (
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition-colors"
          >
            <Edit2 className="w-3 h-3" />
            <span>{language === 'ta' ? 'மாற்று' : 'Edit'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {items.map((item, idx) => (
          <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
            <div className="p-1 rounded-lg bg-emerald-100 text-emerald-800 mt-0.5 shrink-0">
              <item.icon className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">
                {language === 'ta' ? item.label_ta : item.label_en}
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-900">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
