import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limiter';
import { matchSchemes } from '@/lib/matcher';
import { Scheme, UserProfile } from '@/lib/types';
import schemesData from '@/data/schemes.json';

export const dynamic = 'force-dynamic';

const schemes = schemesData as unknown as Scheme[];

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting by IP
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
    const rateLimit = checkRateLimit(ip, 60, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait a moment before trying again.',
          resetInMs: rateLimit.resetInMs,
        },
        { status: 429 }
      );
    }

    // 2. Parse profile from body
    const body = await req.json().catch(() => null);
    if (!body || typeof body.profile !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body. "profile" object is required.' },
        { status: 400 }
      );
    }

    const profile: UserProfile = body.profile;

    // 3. Deterministic rule evaluation
    const matchResults = matchSchemes(profile, schemes);

    return NextResponse.json({
      success: true,
      data: matchResults,
    });
  } catch (error) {
    console.error('API /api/match error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred in the eligibility matching engine.' },
      { status: 500 }
    );
  }
}
