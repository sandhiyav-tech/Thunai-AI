'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Language, MatchEngineResult } from '@/lib/types';
import { VoiceButton } from './VoiceButton';
import { AudioPlayerButton } from './AudioPlayerButton';
import { ProfileSummary } from './ProfileSummary';
import {
  Send,
  Loader2,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';

interface ChatInterfaceProps {
  language: Language;
  onMatchComplete: (result: MatchEngineResult) => void;
  initialProfile?: UserProfile;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text_ta: string;
  text_en: string;
  quickOptions?: { label_ta: string; label_en: string; value: string }[];
  fieldKey?: keyof UserProfile;
}

const TN_DISTRICTS = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli',
  'Thanjavur', 'Erode', 'Vellore', 'Dindigul', 'Thoothukudi', 'Kanchipuram',
  'Tiruvannamalai', 'Villupuram', 'Cuddalore', 'Nagapattinam', 'Tiruvarur',
  'Pudukkottai', 'Sivaganga', 'Ramanathapuram', 'Virudhunagar', 'Theni', 'Karur',
  'Namakkal', 'Dharmapuri', 'Krishnagiri', 'Nilgiris', 'Perambalur', 'Ariyalur',
  'Kallakurichi', 'Tenkasi', 'Tirupathur', 'Ranipet', 'Chengalpattu'
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  language,
  onMatchComplete,
  initialProfile = {},
}) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [matching, setMatching] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Conversational questions pipeline
  const conversationSteps: Message[] = [
    {
      id: 'step_gender',
      sender: 'bot',
      text_ta: 'வணக்கம்! முதலில் உங்கள் பாலினத்தைத் தேர்ந்தெடுக்கவும் அல்லது கூறவும்:',
      text_en: 'Hello! First, please select or state your gender:',
      quickOptions: [
        { label_ta: '👩 பெண்', label_en: '👩 Female', value: 'பெண், female' },
        { label_ta: '👨 ஆண்', label_en: '👨 Male', value: 'ஆண், male' },
        { label_ta: '🌈 திருநங்கை', label_en: '🌈 Transgender', value: 'திருநங்கை, transgender' },
      ],
      fieldKey: 'gender',
    },
    {
      id: 'step_age',
      sender: 'bot',
      text_ta: 'உங்கள் வயது என்ன? (எடுத்துக்காட்டு: 25, 45, 65)',
      text_en: 'What is your age? (e.g. 25, 45, 65)',
      quickOptions: [
        { label_ta: '18 - 25 வயது', label_en: '18 - 25 yrs', value: 'வயது 20' },
        { label_ta: '26 - 40 வயது', label_en: '26 - 40 yrs', value: 'வயது 32' },
        { label_ta: '41 - 59 வயது', label_en: '41 - 59 yrs', value: 'வயது 48' },
        { label_ta: '60+ முதியவர்', label_en: '60+ Senior', value: 'வயது 65, முதியவர்' },
      ],
      fieldKey: 'age',
    },
    {
      id: 'step_occ',
      sender: 'bot',
      text_ta: 'உங்கள் முதன்மை தொழில் என்ன?',
      text_en: 'What is your primary occupation?',
      quickOptions: [
        { label_ta: '🌾 விவசாயி', label_en: '🌾 Farmer', value: 'விவசாயி, farmer' },
        { label_ta: '🎓 மாணவர் / மாணவி', label_en: '🎓 Student', value: 'மாணவர், student' },
        { label_ta: '🔨 கூலி / கட்டுமானத் தொழிலாளி', label_en: '🔨 Daily wage worker', value: 'கூலித் தொழிலாளி, construction worker' },
        { label_ta: '🏠 இல்லத்தரசி', label_en: '🏠 Homemaker', value: 'இல்லத்தரசி, homemaker' },
        { label_ta: '💼 மற்றவை', label_en: '💼 Other', value: 'மற்ற தொழில், other' },
      ],
      fieldKey: 'occupation',
    },
    {
      id: 'step_income',
      sender: 'bot',
      text_ta: 'உங்கள் குடும்பத்தின் ஆண்டு மொத்த வருமானம் தோராயமாக எவ்வளவு?',
      text_en: 'What is your approximate annual family income?',
      quickOptions: [
        { label_ta: '₹72,000-க்குள்', label_en: 'Under ₹72,000', value: 'ஆண்டு வருமானம் 60000 ரூபாய்' },
        { label_ta: '₹1.2 லட்சத்திற்குள்', label_en: 'Under ₹1.2 Lakhs', value: 'ஆண்டு வருமானம் 1 லட்சம் ரூபாய்' },
        { label_ta: '₹2.5 லட்சத்திற்குள்', label_en: 'Under ₹2.5 Lakhs', value: 'ஆண்டு வருமானம் 2 லட்சம் ரூபாய்' },
        { label_ta: '₹2.5 லட்சத்திற்கு மேல்', label_en: 'Above ₹2.5 Lakhs', value: 'ஆண்டு வருமானம் 4 லட்சம் ரூபாய்' },
      ],
      fieldKey: 'annual_income',
    },
    {
      id: 'step_district',
      sender: 'bot',
      text_ta: 'நீங்கள் தமிழ்நாட்டில் எந்த மாவட்டத்தில் வசிக்கிறீர்கள்?',
      text_en: 'Which district in Tamil Nadu do you live in?',
      quickOptions: [
        { label_ta: 'சென்னை', label_en: 'Chennai', value: 'Chennai' },
        { label_ta: 'மதுரை', label_en: 'Madurai', value: 'Madurai' },
        { label_ta: 'கோயம்புத்தூர்', label_en: 'Coimbatore', value: 'Coimbatore' },
        { label_ta: 'தஞ்சாவூர்', label_en: 'Thanjavur', value: 'Thanjavur' },
        { label_ta: 'திருச்சி', label_en: 'Tiruchirappalli', value: 'Tiruchirappalli' },
        { label_ta: 'சேலம்', label_en: 'Salem', value: 'Salem' },
      ],
      fieldKey: 'district',
    },
    {
      id: 'step_extra',
      sender: 'bot',
      text_ta: 'இறுதியாக: உங்களுக்கு சொந்த நிலம் உள்ளதா அல்லது மாற்றுத்திறனாளி தகுதி உள்ளதா?',
      text_en: 'Finally: Do you own agricultural land or have a disability certificate?',
      quickOptions: [
        { label_ta: '🌾 2 ஏக்கர் நிலம் உள்ளது', label_en: '🌾 2 acres land', value: 'சொந்தமாக 2 ஏக்கர் விவசாய நிலம் உள்ளது' },
        { label_ta: '🚫 சொந்த நிலம் இல்லை', label_en: '🚫 No land owned', value: 'சொந்த நிலம் இல்லை' },
        { label_ta: '♿ மாற்றுத்திறனாளி', label_en: '♿ Differently Abled', value: 'மாற்றுத்திறனாளி, disability certificate உண்டு' },
        { label_ta: '🎓 கல்லூரி மாணவர்', label_en: '🎓 College Student', value: 'கல்லூரியில் பயிலும் மாணவர்' },
      ],
    },
  ];

  const [chatHistory, setChatHistory] = useState<Message[]>([
    conversationSteps[0],
  ]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  // Send message to /api/extract
  const handleProcessInput = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text_ta: text,
      text_en: text,
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          profile,
        }),
      });

      const data = await res.json();
      if (data.profile) {
        setProfile((prev) => ({ ...prev, ...data.profile }));
      }

      // Progress to next question
      const nextStepIndex = currentStep + 1;
      if (nextStepIndex < conversationSteps.length) {
        setCurrentStep(nextStepIndex);
        setChatHistory((prev) => [...prev, conversationSteps[nextStepIndex]]);
      } else {
        // All primary questions asked
        const doneMsg: Message = {
          id: 'step_done',
          sender: 'bot',
          text_ta: 'அருமை! உங்கள் விவரங்கள் பதிவு செய்யப்பட்டுள்ளன. உங்களுக்கான தகுதியான திட்டங்களைப் பார்க்க கீழே உள்ள பொத்தானை அழுத்தவும்.',
          text_en: 'Great! Your profile is recorded. Click the button below to see the schemes you are eligible for.',
        };
        setChatHistory((prev) => [...prev, doneMsg]);
      }
    } catch (err) {
      console.error('Extract error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run the deterministic matcher via /api/match
  const handleCheckSchemes = async () => {
    setMatching(true);
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      const data = await res.json();
      if (data.data) {
        onMatchComplete(data.data);
      }
    } catch (err) {
      console.error('Match error:', err);
    } finally {
      setMatching(false);
    }
  };

  const handleResetProfile = () => {
    setProfile({});
    setCurrentStep(0);
    setChatHistory([conversationSteps[0]]);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6 space-y-4">
      {/* Extracted Profile Progress Badge */}
      <ProfileSummary profile={profile} language={language} compact />

      {/* Main Chat Box */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md flex flex-col h-[520px] sm:h-[580px] overflow-hidden">
        {/* Chat Messages Scroll Area */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {chatHistory.map((msg) => {
            const isBot = msg.sender === 'bot';
            const text = language === 'ta' ? msg.text_ta : msg.text_en;

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 sm:gap-3 ${
                  isBot ? 'justify-start' : 'justify-end'
                }`}
              >
                {isBot && (
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-xs ${
                    isBot
                      ? 'bg-slate-100 text-slate-900 border border-slate-200'
                      : 'bg-emerald-700 text-white font-medium'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm sm:text-base leading-relaxed">{text}</p>
                    {isBot && (
                      <AudioPlayerButton
                        textToSpeak={text}
                        language={language}
                        compact
                        className="shrink-0 scale-90 -mr-1"
                      />
                    )}
                  </div>

                  {/* Quick-tap pill buttons for easy low-literacy answers */}
                  {isBot && msg.quickOptions && (
                    <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-200">
                      {msg.quickOptions.map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleProcessInput(opt.value)}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-300 hover:border-emerald-400 text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-2xs min-h-[40px]"
                        >
                          {language === 'ta' ? opt.label_ta : opt.label_en}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {!isBot && (
                  <div className="w-9 h-9 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs sm:text-sm italic pl-11">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>{language === 'ta' ? 'விவரங்களைச் சேமிக்கிறது...' : 'Extracting details...'}</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Action Bar: Check Eligible Schemes button */}
        {(profile.age || profile.gender || profile.occupation) && (
          <div className="p-3 bg-emerald-50/90 border-t border-emerald-200 flex items-center justify-between gap-3">
            <span className="text-xs sm:text-sm font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-700" />
              {language === 'ta'
                ? 'விவரங்கள் தயாராக உள்ளன'
                : 'Profile details ready'}
            </span>

            <button
              onClick={handleCheckSchemes}
              disabled={matching}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-700/20 transition-all active:scale-95 min-h-[44px]"
            >
              {matching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === 'ta' ? 'சரிபார்க்கிறது...' : 'Evaluating...'}</span>
                </>
              ) : (
                <>
                  <span>{language === 'ta' ? 'திட்டங்களைக் காண்க' : 'Check Schemes'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Input Bar with Voice & Keyboard */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2 sm:gap-3">
          {/* Big Voice Button */}
          <VoiceButton
            language={language}
            onTranscript={(transcript) => handleProcessInput(transcript)}
            size="normal"
          />

          {/* Text Input Box */}
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleProcessInput(inputVal);
                }
              }}
              placeholder={
                language === 'ta'
                  ? 'தமிழில் பேசவும் அல்லது தட்டச்சு செய்யவும்...'
                  : 'Speak or type your answer here...'
              }
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-white shadow-2xs pr-12 min-h-[48px]"
            />

            <button
              type="button"
              onClick={() => handleProcessInput(inputVal)}
              disabled={!inputVal.trim() || loading}
              className="absolute right-2 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:hover:bg-emerald-600 transition-all active:scale-95 min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
