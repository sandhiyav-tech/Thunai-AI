import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserProfile, SchemeMatch, Language } from './types';

const apiKey = process.env.GEMINI_API_KEY?.trim() || '';

let genAI: GoogleGenerativeAI | null = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

/**
 * Fallback heuristic extractor when GEMINI_API_KEY is not configured or fails.
 * Understands both Tamil and English keywords.
 */
function fallbackRuleBasedExtractor(text: string, current: Partial<UserProfile> = {}): Partial<UserProfile> {
  const result: Partial<UserProfile> = { ...current };
  const lower = text.toLowerCase();

  // Age extraction: e.g. "25 வயது", "வயது 25", "age 25", "25 years old", "25 yrs"
  const ageMatch = text.match(/(?:வயது\s*[:=]?\s*(\d{1,3}))|(?:(\d{1,3})\s*(?:வயது|years old|yrs|age))/i) ||
                   text.match(/\b(\d{2})\b/);
  if (ageMatch) {
    const ageVal = parseInt(ageMatch[1] || ageMatch[2], 10);
    if (!isNaN(ageVal) && ageVal >= 1 && ageVal <= 110) {
      result.age = ageVal;
    }
  }

  // Gender extraction:
  if (lower.includes('பெண்') || lower.includes('female') || lower.includes('woman') || lower.includes('girl') || lower.includes('தாய்') || lower.includes('மனைவி')) {
    result.gender = 'female';
  } else if (lower.includes('ஆண்') || lower.includes('male') || lower.includes('man') || lower.includes('boy')) {
    result.gender = 'male';
  } else if (lower.includes('திருநங்கை') || lower.includes('transgender')) {
    result.gender = 'transgender';
  }

  // Occupation extraction:
  if (lower.includes('விவசாயி') || lower.includes('farmer') || lower.includes('விவசாயம்') || lower.includes('வேளாண்மை') || lower.includes('agriculture')) {
    result.occupation = 'farmer';
    if (result.has_land === undefined) result.has_land = true;
  } else if (lower.includes('மாணவர்') || lower.includes('மாணவி') || lower.includes('student') || lower.includes('படிக்கிறேன்') || lower.includes('college') || lower.includes('school')) {
    result.occupation = 'student';
    result.is_student = true;
    if (lower.includes('கல்லூரி') || lower.includes('college') || lower.includes('degree') || lower.includes('பட்டப்படிப்பு')) {
      result.student_level = 'college';
    } else if (lower.includes('பள்ளி') || lower.includes('school') || lower.includes('10th') || lower.includes('12th')) {
      result.student_level = 'school';
    }
  } else if (lower.includes('கூலி') || lower.includes('தொழிலாளி') || lower.includes('கட்டுமானம்') || lower.includes('worker') || lower.includes('mason') || lower.includes('coolie') || lower.includes('labour')) {
    result.occupation = 'worker';
  } else if (lower.includes('இல்லத்தரசி') || lower.includes('வீட்டு வேலை') || lower.includes('homemaker') || lower.includes('housewife')) {
    result.occupation = 'homemaker';
  } else if (lower.includes('முதியவர்') || lower.includes('வயதானவர்') || lower.includes('elderly') || lower.includes('senior')) {
    result.occupation = 'elderly';
  }

  // Income extraction: e.g. "வருமானம் 50000", "income 1 lakh", "1.5 லட்சம்", "80000"
  const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:லட்சம்|lakh|lakhs)/i);
  if (lakhMatch) {
    result.annual_income = Math.round(parseFloat(lakhMatch[1]) * 100000);
  } else {
    const incomeMatch = text.match(/(?:வருமானம்|income|salary)\s*[:=]?\s*(?:rs\.?|inr|₹)?\s*(\d+)/i) ||
                        text.match(/(?:rs\.?|inr|₹)\s*(\d{4,7})/i);
    if (incomeMatch) {
      result.annual_income = parseInt(incomeMatch[1], 10);
    }
  }

  // Land acres: e.g. "2 ஏக்கர்", "3 acres", "நிலம் இல்லை"
  if (lower.includes('நிலம் இல்லை') || lower.includes('no land') || lower.includes('landless')) {
    result.has_land = false;
    result.land_acres = 0;
  } else {
    const acreMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:ஏக்கர்|acre|acres)/i);
    if (acreMatch) {
      result.has_land = true;
      result.land_acres = parseFloat(acreMatch[1]);
    }
  }

  // Disability:
  if (lower.includes('மாற்றுத்திறனாளி') || lower.includes('disability') || lower.includes('handicapped') || lower.includes('ஊனம்')) {
    result.is_differently_abled = true;
  }

  // District keywords:
  const tnDistricts = [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Thanjavur',
    'Erode', 'Vellore', 'Dindigul', 'Thoothukudi', 'Kanchipuram', 'Tiruvannamalai', 'Villupuram',
    'Cuddalore', 'Nagapattinam', 'Tiruvarur', 'Pudukkottai', 'Sivaganga', 'Ramanathapuram',
    'Virudhunagar', 'Theni', 'Karur', 'Namakkal', 'Dharmapuri', 'Krishnagiri', 'Nilgiris',
    'Perambalur', 'Ariyalur', 'Kallakurichi', 'Tenkasi', 'Tirupathur', 'Ranipet', 'Chengalpattu'
  ];
  for (const d of tnDistricts) {
    if (lower.includes(d.toLowerCase())) {
      result.district = d;
      break;
    }
  }

  return result;
}

/**
 * Extracts structured profile fields using Google Gemini AI.
 * The model NEVER decides eligibility; it only parses user speech/text into structured attributes.
 */
export async function extractProfileWithGemini(
  userInput: string,
  existingProfile: Partial<UserProfile> = {}
): Promise<Partial<UserProfile>> {
  if (!genAI || !apiKey) {
    return fallbackRuleBasedExtractor(userInput, existingProfile);
  }

  const prompt = `
You are a precise data extractor for "Thunai AI", a public welfare portal for Tamil Nadu citizens.
The user speaks or types in Tamil, Tanglish, or English.
Your ONLY job is to extract user profile details and output a clean JSON object.
CRITICAL RULES:
1. NEVER decide or determine scheme eligibility.
2. Return ONLY raw JSON without markdown code blocks, backticks, or explanatory text.
3. If a field was not explicitly stated or implied by the user, return null for that field or preserve existing values.
4. Annual income must be converted to numeric Indian Rupees (e.g. 1.5 லட்சம் / 1.5 lakh = 150000).
5. Land size must be in acres as a number.

Current Profile so far:
${JSON.stringify(existingProfile, null, 2)}

New user message:
"${userInput}"

Output JSON schema strictly matching:
{
  "age": number | null,
  "gender": "female" | "male" | "transgender" | "other" | null,
  "occupation": "farmer" | "student" | "worker" | "homemaker" | "elderly" | "unemployed" | "other" | null,
  "annual_income": number | null,
  "district": string | null,
  "caste": "general" | "bc" | "mbc" | "sc" | "st" | "other" | null,
  "has_land": boolean | null,
  "land_acres": number | null,
  "is_differently_abled": boolean | null,
  "is_student": boolean | null,
  "student_level": "school" | "college" | "other" | null
}
`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    });

    const response = await model.generateContent(prompt);
    const text = response.response.text().trim();

    // Clean backticks if any
    const cleaned = text.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleaned);

    // Merge with existing profile
    const merged: Partial<UserProfile> = { ...existingProfile };
    for (const [key, val] of Object.entries(parsed)) {
      if (val !== null && val !== undefined) {
        // @ts-expect-error dynamic key assignment
        merged[key] = val;
      }
    }
    return merged;
  } catch (error) {
    console.error('Gemini extraction failed, using heuristic fallback:', error);
    return fallbackRuleBasedExtractor(userInput, existingProfile);
  }
}

/**
 * Rewrites matched results into simple, reassuring, spoken-style Tamil or English.
 * Strictly based ONLY on the matched schemes list passed in; never invents details.
 */
export async function explainResultsWithGemini(
  matchedSchemes: SchemeMatch[],
  language: Language = 'ta'
): Promise<string> {
  if (matchedSchemes.length === 0) {
    return language === 'ta'
      ? 'தங்களின் தற்போதைய விவரங்களுக்கு நேரடியாகப் பொருந்தும் திட்டங்கள் எதுவும் கண்டறியப்படவில்லை. தயவுசெய்து உங்கள் அருகில் உள்ள இ-சேவை மையத்தை அணுகி கூடுதல் விவரங்களை உறுதிப்படுத்திக் கொள்ளவும்.'
      : 'No directly matching schemes were found for your current profile. Please consult your local e-Sevai or CSC centre for further assistance.';
  }

  // Prepare a concise summary payload of the deterministic matches
  const summary = matchedSchemes.map((m, idx) => ({
    number: idx + 1,
    name: language === 'ta' ? m.scheme.name_ta : m.scheme.name_en,
    benefit: language === 'ta' ? m.scheme.benefit_ta : m.scheme.benefit_en,
    reasons: language === 'ta' ? m.reasons_ta : m.reasons_en,
    documents: m.scheme.documents.map((d) => (language === 'ta' ? d.name_ta : d.name_en)),
    how_to_apply: m.scheme.apply_steps.map((s) => `${s.step}. ${language === 'ta' ? s.title_ta : s.title_en}: ${language === 'ta' ? s.desc_ta : s.desc_en}`).join('; '),
  }));

  // Fallback template when Gemini is not configured
  const fallbackExplanation = language === 'ta'
    ? `வணக்கம்! உங்கள் விவரங்களின்படி, நீங்கள் விண்ணப்பிக்க தகுதியான ${matchedSchemes.length} அரசு திட்டங்கள் கண்டறியப்பட்டுள்ளன:\n\n` +
      matchedSchemes.map((m, i) => `${i + 1}. **${m.scheme.name_ta}**: ${m.scheme.benefit_ta}\n- தேவைப்படும் முக்கிய ஆவணங்கள்: ${m.scheme.documents.slice(0, 3).map(d => d.name_ta).join(', ')}.\n- விண்ணப்பிக்கும் இடம்: உங்கள் அருகில் உள்ள இ-சேவை மையம் அல்லது தாலுகா அலுவலகம்.`).join('\n\n') +
      '\n\nகுறிப்பு: தகவல்கள் வழிகாட்டலுக்கு மட்டுமே. அரசு அலுவலகத்தில் உறுதிப்படுத்தவும்.'
    : `Hello! Based on your details, you qualify for ${matchedSchemes.length} government schemes:\n\n` +
      matchedSchemes.map((m, i) => `${i + 1}. **${m.scheme.name_en}**: ${m.scheme.benefit_en}\n- Key Documents: ${m.scheme.documents.slice(0, 3).map(d => d.name_en).join(', ')}.\n- Where to apply: Nearest e-Sevai / CSC Centre or Taluk Office.`).join('\n\n') +
      '\n\nNote: Information is for guidance only. Please verify at your local official office.';

  if (!genAI || !apiKey) {
    return fallbackExplanation;
  }

  const prompt = `
You are an empathetic, warm, and highly trustworthy rural voice assistant for "Thunai AI".
You are speaking to a citizen in Tamil Nadu (e.g. a farmer, daily-wage worker, elderly person, or student) who has limited literacy.

TASK:
Explain the following matched government schemes in very simple, conversational ${language === 'ta' ? 'spoken Tamil (தூய மற்றும் எளிய பேச்சுத் தமிழ்)' : 'simple English'}.
The explanation should be easy to read and suitable for text-to-speech audio playback.

MATCHED SCHEMES DATA (STRICT TRUTH SOURCE):
${JSON.stringify(summary, null, 2)}

STRICT RULES:
1. Rely ONLY on the provided matched schemes data above.
2. NEVER invent, assume, or hallucinate schemes, benefits, or official rules.
3. Organize the explanation clearly:
   - Warm greeting.
   - For each scheme: What they get, why they qualify, top 2-3 documents needed, and where to go (e.g. e-Sevai).
   - A concluding reassuring note reminding them to confirm at their local e-Sevai or Taluk office.
4. Keep the language polite, encouraging, and easy to understand.
`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000,
      },
    });

    const response = await model.generateContent(prompt);
    return response.response.text().trim();
  } catch (error) {
    console.error('Gemini explanation failed, using fallback:', error);
    return fallbackExplanation;
  }
}

