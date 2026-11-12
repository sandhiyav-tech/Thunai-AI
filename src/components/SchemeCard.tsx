'use client';

import React, { useState } from 'react';
import { SchemeMatch, Language } from '@/lib/types';
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Landmark,
  ShieldCheck,
  CheckSquare,
  Square,
} from 'lucide-react';
import { AudioPlayerButton } from './AudioPlayerButton';

interface SchemeCardProps {
  match: SchemeMatch;
  language: Language;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({ match, language }) => {
  const { scheme, status, reasons_en, reasons_ta, missing_fields } = match;
  const [expanded, setExpanded] = useState(false);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  const toggleDoc = (docId: string) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }));
  };

  const schemeTitle = language === 'ta' ? scheme.name_ta : scheme.name_en;
  const schemeSubtitle = language === 'ta' ? scheme.name_en : scheme.name_ta;
  const benefit = language === 'ta' ? scheme.benefit_ta : scheme.benefit_en;
  const reasons = language === 'ta' ? reasons_ta : reasons_en;

  // Build spoken text for the card audio button
  const audioText =
    language === 'ta'
      ? `${scheme.name_ta}. இத்திட்டத்தின் பயன்: ${scheme.benefit_ta}. தேவைப்படும் முக்கிய ஆவணங்கள்: ${scheme.documents
          .map((d) => d.name_ta)
          .join(', ')}. விண்ணப்பிக்க வேண்டிய முறை: ${scheme.apply_steps[0]?.title_ta || 'இ-சேவை மையம்'}.`
      : `${scheme.name_en}. Benefit: ${scheme.benefit_en}. Key documents needed: ${scheme.documents
          .map((d) => d.name_en)
          .join(', ')}. Apply at nearest e-Sevai or online.`;

  const isMatched = status === 'matched';

  return (
    <div
      className={`rounded-2xl border-2 transition-all shadow-sm overflow-hidden bg-white ${
        isMatched ? 'border-emerald-300 hover:border-emerald-500' : 'border-amber-300 hover:border-amber-500'
      }`}
    >
      {/* Top Banner Header */}
      <div
        className={`px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2 border-b ${
          isMatched ? 'bg-emerald-50/70 border-emerald-100' : 'bg-amber-50/70 border-amber-100'
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
              isMatched ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
            }`}
          >
            {isMatched ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {isMatched
              ? language === 'ta'
                ? 'நேரடி தகுதி உண்டு'
                : 'Directly Eligible'
              : language === 'ta'
              ? 'சரிபார்க்க வேண்டியவை'
              : 'Needs Confirmation'}
          </span>

          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 uppercase">
            {scheme.level === 'state'
              ? language === 'ta'
                ? 'தமிழக அரசு'
                : 'TN State'
              : language === 'ta'
              ? 'மத்திய அரசு'
              : 'Central Govt'}
          </span>
        </div>

        {/* Verification Status Warning Pill */}
        <span className="text-[11px] font-semibold text-slate-500 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
          🔍 {scheme.verification_status}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {schemeTitle}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
              {schemeSubtitle}
            </p>
          </div>

          {/* Card Listen Button */}
          <AudioPlayerButton
            textToSpeak={audioText}
            language={language}
            compact
            className="shrink-0"
          />
        </div>

        {/* Benefit Highlight Box */}
        <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-emerald-50/90 border border-emerald-200">
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
            {language === 'ta' ? 'கிடைக்கும் நேரடி பயன் / உதவித்தொகை:' : 'Financial Benefit & Assistance:'}
          </p>
          <p className="text-base sm:text-lg font-bold text-emerald-950 mt-1 leading-snug">
            {benefit}
          </p>
        </div>

        {/* Eligibility Reasons */}
        <div className="mt-4">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {language === 'ta' ? 'நீங்கள் ஏன் தகுதியானவர்?' : 'Why you qualify:'}
          </h4>
          <ul className="space-y-1">
            {reasons.map((r, i) => (
              <li key={i} className="text-xs sm:text-sm text-slate-800 font-medium flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Missing Fields notice if 'maybe' */}
        {!isMatched && missing_fields.length > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900">
            <p className="font-semibold flex items-center gap-1 text-amber-950">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
              {language === 'ta' ? 'உறுதிப்படுத்த வேண்டிய விவரங்கள்:' : 'Details to be confirmed:'}
            </p>
            <p className="mt-1">
              {language === 'ta'
                ? `இத்திட்டத்திற்கு ${missing_fields.join(', ')} தொடர்பான கூடுதல் விவரங்கள் தேவைப்படுகிறது.`
                : `Requires confirming: ${missing_fields.join(', ')}.`}
            </p>
          </div>
        )}

        {/* Required Documents Interactive Checklist */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-700" />
              {language === 'ta' ? 'தேவையான ஆவணங்கள் (சரிபார்க்க கிளிக் செய்யவும்):' : 'Required Documents (Tap to check):'}
            </h4>
            <span className="text-[11px] font-semibold text-slate-500">
              {Object.values(checkedDocs).filter(Boolean).length} / {scheme.documents.length}{' '}
              {language === 'ta' ? 'உங்களிடம் உள்ளது' : 'ready'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {scheme.documents.map((doc) => {
              const isChecked = checkedDocs[doc.id] || false;
              const docName = language === 'ta' ? doc.name_ta : doc.name_en;

              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => toggleDoc(doc.id)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all active:scale-98 min-h-[44px] ${
                    isChecked
                      ? 'bg-emerald-100/70 border-emerald-300 text-emerald-950 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <span className="mt-0.5 shrink-0">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </span>
                  <span className="text-xs sm:text-sm leading-snug">{docName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Expandable Steps Section */}
        {expanded && (
          <div className="mt-5 pt-4 border-t border-slate-200 space-y-4 animate-fadeIn">
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-emerald-700" />
                {language === 'ta' ? 'எப்படி மற்றும் எங்கு விண்ணப்பிப்பது?' : 'How & Where to Apply:'}
              </h4>
              <div className="space-y-2.5">
                {scheme.apply_steps.map((st) => (
                  <div key={st.step} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[11px] flex items-center justify-center font-bold">
                        {st.step}
                      </span>
                      {language === 'ta' ? st.title_ta : st.title_en}
                    </p>
                    <p className="mt-1 text-slate-700 pl-6 leading-relaxed">
                      {language === 'ta' ? st.desc_ta : st.desc_en}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Link and Last Verified Date */}
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <a
                href={scheme.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-emerald-800 hover:text-emerald-950 underline decoration-emerald-500 min-h-[40px]"
              >
                <ExternalLink className="w-4 h-4" />
                <span>
                  {language === 'ta'
                    ? 'அதிகாரப்பூர்வ அரசு இணையதளம் பார்க்க'
                    : 'Visit Official Government Portal'}
                </span>
              </a>
              <span className="text-slate-500 font-medium">
                {language === 'ta' ? 'கடைசியாக சரிபார்க்கப்பட்டது:' : 'Last verified:'} {scheme.last_verified}
              </span>
            </div>
          </div>
        )}

        {/* Toggle Details Expand Button */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors active:scale-98 min-h-[44px]"
        >
          {expanded ? (
            <>
              <span>{language === 'ta' ? 'விவரங்களை மறை' : 'Hide Details'}</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>
                {language === 'ta' ? 'விண்ணப்பிக்கும் முறை & இணையதளம் பார்க்க' : 'View How to Apply & Official Link'}
              </span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
