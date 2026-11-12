import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { matchSchemes, matchScheme } from '../src/lib/matcher';
import { Scheme, UserProfile } from '../src/lib/types';
import schemesData from '../src/data/schemes.json';

const schemes = schemesData as unknown as Scheme[];

describe('Tamil Nadu Schemes Deterministic Matching Engine Tests', () => {

  test('Profile 1: Small farmer woman (KMUT, PM-KISAN, CMCHIS, Uzhavar Pathukappu)', () => {
    const profile: UserProfile = {
      age: 32,
      gender: 'female',
      occupation: 'farmer',
      annual_income: 110000,
      has_land: true,
      land_acres: 2.0,
      is_differently_abled: false,
      is_student: false,
      district: 'Thanjavur',
    };

    const results = matchSchemes(profile, schemes);
    const matchedIds = results.matched.map((m) => m.scheme.id);

    // Should qualify for KMUT (female, age >= 21, income <= 2.5L, land <= 5)
    assert.ok(matchedIds.includes('kmut'), 'Should match KMUT');

    // Should qualify for PM-KISAN (farmer with land)
    assert.ok(matchedIds.includes('pm_kisan'), 'Should match PM-KISAN');

    // Should qualify for CMCHIS (income 1.1L <= 1.2L)
    assert.ok(matchedIds.includes('cmchis'), 'Should match CMCHIS');

    // Should qualify for Uzhavar Pathukappu (farmer with <= 2.5 acres)
    assert.ok(matchedIds.includes('uzhavar_pathukappu'), 'Should match Uzhavar Pathukappu');

    // Should NOT qualify for OAP (age 32 < 60)
    assert.ok(!matchedIds.includes('oap_tn'), 'Should NOT match OAP');
  });

  test('Profile 2: Female college student from government school (Pudhumai Penn & Free Laptop)', () => {
    const profile: UserProfile = {
      age: 19,
      gender: 'female',
      occupation: 'student',
      is_student: true,
      student_level: 'college',
      annual_income: 50000,
      has_land: false,
      district: 'Madurai',
    };

    const results = matchSchemes(profile, schemes);
    const matchedIds = results.matched.map((m) => m.scheme.id);

    // Should match Pudhumai Penn
    assert.ok(matchedIds.includes('pudhumai_penn'), 'Should match Pudhumai Penn');

    // Should match Free Laptop
    assert.ok(matchedIds.includes('free_laptop_scheme'), 'Should match Free Laptop');

    // Should NOT match KMUT (age 19 < 21)
    const kmutMatch = results.unmatched.find((m) => m.scheme.id === 'kmut');
    assert.ok(kmutMatch, 'KMUT should be in unmatched because age is 19 < 21');
  });

  test('Profile 3: Destitute 68-year-old elderly person (Old Age Pension & CMCHIS)', () => {
    const profile: UserProfile = {
      age: 68,
      gender: 'male',
      occupation: 'elderly',
      annual_income: 40000,
      has_land: false,
      district: 'Tirunelveli',
    };

    const results = matchSchemes(profile, schemes);
    const matchedIds = results.matched.map((m) => m.scheme.id);

    // Should match OAP (age 68 >= 60, income 40k <= 1L)
    assert.ok(matchedIds.includes('oap_tn'), 'Should match Old Age Pension');

    // Should match CMCHIS (income 40k <= 1.2L)
    assert.ok(matchedIds.includes('cmchis'), 'Should match CMCHIS');

    // Should NOT match KMUT (male)
    assert.ok(!matchedIds.includes('kmut'), 'Should NOT match KMUT for male');
  });

  test('Profile 4: Daily wage construction worker (Construction Welfare Board)', () => {
    const profile: UserProfile = {
      age: 38,
      gender: 'male',
      occupation: 'worker',
      annual_income: 180000,
      has_land: false,
      district: 'Coimbatore',
    };

    const results = matchSchemes(profile, schemes);
    const matchedIds = results.matched.map((m) => m.scheme.id);

    // Should match TN Construction Workers Welfare Board
    assert.ok(matchedIds.includes('tn_construction_welfare'), 'Should match Construction Welfare Board');

    // Should NOT match CMCHIS because income 1.8L > 1.2L
    const cmchisMatch = results.unmatched.find((m) => m.scheme.id === 'cmchis');
    assert.ok(cmchisMatch, 'CMCHIS should be unmatched due to income limit');
  });

  test('Profile 5: Differently abled individual (Differently Abled Maintenance Allowance)', () => {
    const profile: UserProfile = {
      age: 26,
      gender: 'female',
      occupation: 'other',
      is_differently_abled: true,
      disability_percentage: 60,
      annual_income: 60000,
      district: 'Salem',
    };

    const results = matchSchemes(profile, schemes);
    const matchedIds = results.matched.map((m) => m.scheme.id);

    // Should match Differently Abled Maintenance Allowance
    assert.ok(matchedIds.includes('differently_abled_maintenance'), 'Should match Differently Abled Allowance');
  });

  test('Profile 6: High-income earner above scheme income ceilings', () => {
    const profile: UserProfile = {
      age: 42,
      gender: 'female',
      occupation: 'other',
      annual_income: 800000, // ₹8 Lakhs
      district: 'Chennai',
    };

    const results = matchSchemes(profile, schemes);
    const matchedIds = results.matched.map((m) => m.scheme.id);

    // KMUT has max_income 250000, CMCHIS has 120000, Moovalur Marriage has 72000
    assert.ok(!matchedIds.includes('kmut'), 'KMUT should not match high income');
    assert.ok(!matchedIds.includes('cmchis'), 'CMCHIS should not match high income');
    assert.ok(!matchedIds.includes('moovalur_marriage_assistance'), 'Moovalur Marriage should not match high income');
  });

  test('Profile 7: Young male farmer with cultivable land (PM-KISAN)', () => {
    const profile: UserProfile = {
      age: 28,
      gender: 'male',
      occupation: 'farmer',
      has_land: true,
      land_acres: 4.5,
      annual_income: 150000,
      district: 'Erode',
    };

    const results = matchSchemes(profile, schemes);
    const matchedIds = results.matched.map((m) => m.scheme.id);

    // Qualifies for PM-KISAN
    assert.ok(matchedIds.includes('pm_kisan'), 'Should match PM-KISAN');

    // Should NOT qualify for KMUT (male)
    const kmutMatch = results.unmatched.find((m) => m.scheme.id === 'kmut');
    assert.ok(kmutMatch, 'KMUT must be unmatched for male');
  });

  test('Profile 8: Homemaker with missing income information (Returns "maybe" status)', () => {
    const profile: UserProfile = {
      age: 35,
      gender: 'female',
      occupation: 'homemaker',
      // annual_income not provided (null / undefined)
      district: 'Dindigul',
    };

    const results = matchSchemes(profile, schemes);
    const maybeKmut = results.maybe.find((m) => m.scheme.id === 'kmut');

    assert.ok(maybeKmut, 'KMUT should be in "maybe" because income is missing');
    assert.ok(maybeKmut?.missing_fields.includes('annual_income'), 'annual_income should be in missing_fields');
  });

  test('Profile 9: Landless agricultural laborer (Uzhavar Pathukappu, but NOT PM-KISAN)', () => {
    const profile: UserProfile = {
      age: 44,
      gender: 'male',
      occupation: 'farmer',
      has_land: false, // Landless
      annual_income: 90000,
      district: 'Thiruvarur',
    };

    const results = matchSchemes(profile, schemes);
    const matchedIds = results.matched.map((m) => m.scheme.id);
    const unmatchedIds = results.unmatched.map((m) => m.scheme.id);

    // PM-KISAN strictly requires land ownership
    assert.ok(unmatchedIds.includes('pm_kisan'), 'PM-KISAN should be unmatched for landless farmer');

    // CMCHIS matches (income 90k <= 1.2L)
    assert.ok(matchedIds.includes('cmchis'), 'CMCHIS matches for low income');
  });

  test('Profile 10: Young bride from low-income family (Moovalur Marriage Assistance)', () => {
    const profile: UserProfile = {
      age: 23,
      gender: 'female',
      occupation: 'homemaker',
      annual_income: 65000,
      has_land: false,
      district: 'Cuddalore',
    };

    const results = matchSchemes(profile, schemes);
    const matchedIds = results.matched.map((m) => m.scheme.id);

    // Moovalur Marriage requires female, age 18-35, income <= 72000
    assert.ok(matchedIds.includes('moovalur_marriage_assistance'), 'Should match Moovalur Marriage Assistance');

    // Also matches KMUT (female, age >= 21, income <= 2.5L)
    assert.ok(matchedIds.includes('kmut'), 'Should match KMUT');

    // Also matches CMCHIS (income 65k <= 1.2L)
    assert.ok(matchedIds.includes('cmchis'), 'Should match CMCHIS');
  });

});

