import { Scheme, UserProfile, SchemeMatch, MatchEngineResult } from './types';

/**
 * Deterministic Rules-Based Matching Engine for Tamil Nadu Government Schemes.
 * Evaluates a user profile against structured scheme eligibility criteria without any LLM hallucination.
 */
export function matchScheme(profile: UserProfile, scheme: Scheme): SchemeMatch {
  const reasons_en: string[] = [];
  const reasons_ta: string[] = [];
  const missing_fields: string[] = [];
  const unmatched_reasons_en: string[] = [];
  const unmatched_reasons_ta: string[] = [];

  const { eligibility } = scheme;

  // 1. Gender check
  if (eligibility.gender && eligibility.gender !== 'any') {
    if (!profile.gender) {
      missing_fields.push('gender');
    } else if (profile.gender !== eligibility.gender) {
      const genderEn = eligibility.gender === 'female' ? 'women' : eligibility.gender === 'male' ? 'men' : eligibility.gender;
      const genderTa = eligibility.gender === 'female' ? 'பெண்களுக்கு மட்டுமே' : eligibility.gender === 'male' ? 'ஆண்களுக்கு மட்டுமே' : eligibility.gender;
      unmatched_reasons_en.push(`This scheme is exclusively for ${genderEn}.`);
      unmatched_reasons_ta.push(`இத்திட்டம் ${genderTa} உரியது.`);
    } else {
      reasons_en.push(`Meets gender criterion (${eligibility.gender})`);
      reasons_ta.push(`பாலின தகுதி பொருந்துகிறது (${eligibility.gender === 'female' ? 'பெண்' : 'ஆண்'})`);
    }
  }

  // 2. Age check
  if (eligibility.min_age !== undefined || eligibility.max_age !== undefined) {
    if (profile.age === undefined || profile.age === null) {
      missing_fields.push('age');
    } else {
      if (eligibility.min_age !== undefined && profile.age < eligibility.min_age) {
        unmatched_reasons_en.push(`Minimum age is ${eligibility.min_age} years (current age: ${profile.age}).`);
        unmatched_reasons_ta.push(`குறைந்தபட்ச வயது ${eligibility.min_age} ஆண்டுகள் (தற்போதைய வயது: ${profile.age}).`);
      } else if (eligibility.max_age !== undefined && profile.age > eligibility.max_age) {
        unmatched_reasons_en.push(`Maximum age is ${eligibility.max_age} years (current age: ${profile.age}).`);
        unmatched_reasons_ta.push(`அதிகபட்ச வயது ${eligibility.max_age} ஆண்டுகள் (தற்போதைய வயது: ${profile.age}).`);
      } else {
        reasons_en.push(`Age ${profile.age} is within eligible bracket (${eligibility.min_age ?? 0} - ${eligibility.max_age ?? 'No limit'})`);
        reasons_ta.push(`வயது ${profile.age} அனுமதிக்கப்பட்ட வரம்பிற்குள் உள்ளது (${eligibility.min_age ?? 0} முதல் ${eligibility.max_age ?? 'வரம்பில்லை'})`);
      }
    }
  }

  // 3. Occupation check
  if (eligibility.occupations && eligibility.occupations.length > 0) {
    if (!profile.occupation) {
      missing_fields.push('occupation');
    } else {
      const occMatch = eligibility.occupations.includes(profile.occupation);
      if (!occMatch) {
        // Special case: if scheme needs student and profile says is_student === true, allow it
        if (eligibility.occupations.includes('student') && profile.is_student === true) {
          reasons_en.push(`Qualified as a student`);
          reasons_ta.push(`மாணவர் தகுதி பொருந்துகிறது`);
        } else {
          unmatched_reasons_en.push(`Occupation '${profile.occupation}' does not qualify for this scheme (Requires: ${eligibility.occupations.join(', ')}).`);
          unmatched_reasons_ta.push(`தொழில் தகுதி பொருந்தவில்லை (தேவை: ${eligibility.occupations.join(', ')}).`);
        }
      } else {
        reasons_en.push(`Eligible occupation: ${profile.occupation}`);
        reasons_ta.push(`தகுதியான தொழில்: ${profile.occupation}`);
      }
    }
  }

  // 4. Student check
  if (eligibility.is_student) {
    if (profile.is_student === false) {
      unmatched_reasons_en.push(`Must be currently enrolled as an active student.`);
      unmatched_reasons_ta.push(`தற்போது பயிலும் மாணவராக இருக்க வேண்டும்.`);
    } else if (profile.is_student === undefined || profile.is_student === null) {
      if (profile.occupation !== 'student') {
        missing_fields.push('is_student');
      }
    } else if (profile.is_student === true || profile.occupation === 'student') {
      reasons_en.push(`Currently enrolled student`);
      reasons_ta.push(`பயிலும் மாணவர்`);

      // Check student level (e.g. college vs school)
      if (eligibility.student_level && eligibility.student_level !== 'any') {
        if (!profile.student_level) {
          missing_fields.push('student_level');
        } else if (profile.student_level !== eligibility.student_level) {
          unmatched_reasons_en.push(`Must be enrolled at ${eligibility.student_level} level (current: ${profile.student_level}).`);
          unmatched_reasons_ta.push(`${eligibility.student_level === 'college' ? 'கல்லூரி' : 'பள்ளி'} நிலை மாணவராக இருக்க வேண்டும்.`);
        } else {
          reasons_en.push(`Student level matches: ${eligibility.student_level}`);
          reasons_ta.push(`கல்வி நிலை பொருந்துகிறது: ${eligibility.student_level === 'college' ? 'கல்லூரி' : 'பள்ளி'}`);
        }
      }
    }
  }

  // 5. Income check
  if (eligibility.max_income !== undefined) {
    if (profile.annual_income === undefined || profile.annual_income === null) {
      missing_fields.push('annual_income');
    } else {
      if (profile.annual_income > eligibility.max_income) {
        unmatched_reasons_en.push(`Annual income ₹${profile.annual_income.toLocaleString('en-IN')} exceeds limit of ₹${eligibility.max_income.toLocaleString('en-IN')}.`);
        unmatched_reasons_ta.push(`ஆண்டு வருமானம் ₹${profile.annual_income.toLocaleString('en-IN')} அதிகபட்ச வரம்பான ₹${eligibility.max_income.toLocaleString('en-IN')}-ஐ விட அதிகம்.`);
      } else {
        reasons_en.push(`Income ₹${profile.annual_income.toLocaleString('en-IN')} is within ceiling (₹${eligibility.max_income.toLocaleString('en-IN')})`);
        reasons_ta.push(`வருமானம் ₹${profile.annual_income.toLocaleString('en-IN')} நிர்ணயிக்கப்பட்ட வரம்பிற்குள் உள்ளது (₹${eligibility.max_income.toLocaleString('en-IN')})`);
      }
    }
  }

  // 6. Land ownership check
  if (eligibility.requires_land === true) {
    if (profile.has_land === false) {
      unmatched_reasons_en.push(`Requires ownership of cultivable agricultural land.`);
      unmatched_reasons_ta.push(`விவசாய சாகுபடி நிலம் சொந்தமாக இருக்க வேண்டும்.`);
    } else if (profile.has_land === undefined || profile.has_land === null) {
      missing_fields.push('has_land');
    } else {
      reasons_en.push(`Owns agricultural land`);
      reasons_ta.push(`சொந்தமாக விவசாய நிலம் உள்ளது`);
    }
  }

  // 7. Max land acres limit check (e.g. for small/marginal farmer schemes)
  if (eligibility.max_land_acres !== undefined) {
    if (profile.has_land && profile.land_acres !== undefined && profile.land_acres !== null) {
      if (profile.land_acres > eligibility.max_land_acres) {
        unmatched_reasons_en.push(`Land holding (${profile.land_acres} acres) exceeds upper ceiling of ${eligibility.max_land_acres} acres.`);
        unmatched_reasons_ta.push(`நில அளவு (${profile.land_acres} ஏக்கர்) அனுமதிக்கப்பட்ட ${eligibility.max_land_acres} ஏக்கருக்கு மேல் உள்ளது.`);
      } else {
        reasons_en.push(`Land holding (${profile.land_acres} acres) is within ceiling (${eligibility.max_land_acres} acres)`);
        reasons_ta.push(`நில அளவு (${profile.land_acres} ஏக்கர்) அனுமதிக்கப்பட்ட வரம்பிற்குள் உள்ளது (${eligibility.max_land_acres} ஏக்கர்)`);
      }
    }
  }

  // 8. Disability check
  if (eligibility.disability_required === true) {
    if (profile.is_differently_abled === false) {
      unmatched_reasons_en.push(`Scheme is reserved for persons with benchmark disabilities.`);
      unmatched_reasons_ta.push(`இத்திட்டம் மாற்றுத்திறனாளிகளுக்காக மட்டுமே உருவாக்கப்பட்டது.`);
    } else if (profile.is_differently_abled === undefined || profile.is_differently_abled === null) {
      missing_fields.push('is_differently_abled');
    } else {
      reasons_en.push(`Applicant has certified disability`);
      reasons_ta.push(`மாற்றுத்திறனாளி தகுதி பொருந்துகிறது`);
    }
  }

  // 9. Caste category check
  if (eligibility.caste_categories && eligibility.caste_categories.length > 0 && !eligibility.caste_categories.includes('any')) {
    if (!profile.caste) {
      // Caste is optional in many cases, but if scheme strictly specifies, add to missing
      missing_fields.push('caste');
    } else if (!eligibility.caste_categories.includes(profile.caste)) {
      unmatched_reasons_en.push(`Caste category '${profile.caste}' is not covered by this specific scheme.`);
      unmatched_reasons_ta.push(`சமூகப் பிரிவு '${profile.caste}' இத்திட்டத்தில் உள்ளடக்கப்படவில்லை.`);
    } else {
      reasons_en.push(`Eligible social category: ${profile.caste.toUpperCase()}`);
      reasons_ta.push(`தகுதியான சமூகப் பிரிவு: ${profile.caste.toUpperCase()}`);
    }
  }

  // Determine final status
  let status: 'matched' | 'maybe' | 'unmatched';
  if (unmatched_reasons_en.length > 0) {
    status = 'unmatched';
  } else if (missing_fields.length > 0) {
    status = 'maybe';
  } else {
    status = 'matched';
  }

  return {
    scheme,
    status,
    reasons_en,
    reasons_ta,
    missing_fields,
    unmatched_reasons_en,
    unmatched_reasons_ta,
  };
}

/**
 * Match all schemes against the given profile and bucket them into matched, maybe, and unmatched.
 */
export function matchSchemes(profile: UserProfile, schemes: Scheme[]): MatchEngineResult {
  const matched: SchemeMatch[] = [];
  const maybe: SchemeMatch[] = [];
  const unmatched: SchemeMatch[] = [];

  for (const scheme of schemes) {
    const result = matchScheme(profile, scheme);
    if (result.status === 'matched') {
      matched.push(result);
    } else if (result.status === 'maybe') {
      maybe.push(result);
    } else {
      unmatched.push(result);
    }
  }

  return {
    matched,
    maybe,
    unmatched,
    evaluated_profile: profile,
  };
}
