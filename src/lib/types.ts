export type Gender = 'female' | 'male' | 'transgender' | 'other';

export type Occupation =
  | 'farmer'
  | 'student'
  | 'worker'
  | 'homemaker'
  | 'elderly'
  | 'unemployed'
  | 'other';

export type CasteCategory = 'general' | 'bc' | 'mbc' | 'sc' | 'st' | 'other';

export type StudentLevel = 'school' | 'college' | 'other';

export interface UserProfile {
  age?: number | null;
  gender?: Gender | null;
  occupation?: Occupation | null;
  annual_income?: number | null;
  district?: string | null;
  caste?: CasteCategory | null;
  has_land?: boolean | null;
  land_acres?: number | null;
  is_differently_abled?: boolean | null;
  disability_percentage?: number | null;
  is_student?: boolean | null;
  student_level?: StudentLevel | null;
  notes?: string;
}

export interface SchemeDocument {
  id: string;
  name_en: string;
  name_ta: string;
  required: boolean;
}

export interface SchemeStep {
  step: number;
  title_en: string;
  title_ta: string;
  desc_en: string;
  desc_ta: string;
}

export interface SchemeEligibility {
  min_age?: number;
  max_age?: number;
  gender?: 'female' | 'male' | 'transgender' | 'any';
  occupations?: string[];
  max_income?: number;
  requires_land?: boolean;
  max_land_acres?: number;
  disability_required?: boolean;
  caste_categories?: string[];
  districts?: string[];
  is_student?: boolean;
  student_level?: string;
  notes_en?: string;
  notes_ta?: string;
}

export interface Scheme {
  id: string;
  name_en: string;
  name_ta: string;
  category: 'financial' | 'agriculture' | 'education' | 'health' | 'social_welfare' | 'pension';
  level: 'state' | 'central';
  benefit_en: string;
  benefit_ta: string;
  eligibility: SchemeEligibility;
  documents: SchemeDocument[];
  apply_steps: SchemeStep[];
  official_url: string;
  last_verified: string;
  verification_status: string;
}

export type MatchStatus = 'matched' | 'maybe' | 'unmatched';

export interface SchemeMatch {
  scheme: Scheme;
  status: MatchStatus;
  reasons_en: string[];
  reasons_ta: string[];
  missing_fields: string[];
  unmatched_reasons_en: string[];
  unmatched_reasons_ta: string[];
}

export interface MatchEngineResult {
  matched: SchemeMatch[];
  maybe: SchemeMatch[];
  unmatched: SchemeMatch[];
  evaluated_profile: UserProfile;
}

export type Language = 'ta' | 'en';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  audioPrompt?: string;
  quickOptions?: { label_en: string; label_ta: string; value: string }[];
  timestamp: number;
}

