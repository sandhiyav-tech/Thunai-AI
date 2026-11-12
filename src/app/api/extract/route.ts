import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, validateInputLength } from '@/lib/rate-limiter';
import { extractProfileWithGemini } from '@/lib/gemini';
import { UserProfile } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting by IP
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
    const rateLimit = checkRateLimit(ip, 40, 60000); // 40 requests/min
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait a moment before trying again.',
          resetInMs: rateLimit.resetInMs,
        },
        { status: 429 }
      );
    }

    // 2. Parse body
    const body = await req.json().catch(() => null);
    if (!body || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request body. "message" string is required.' },
        { status: 400 }
      );
    }

    // 3. Input length validation
    const validation = validateInputLength(body.message, 600);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const currentProfile: Partial<UserProfile> = body.profile || {};

    // 4. Extract structured fields via Gemini (with fallback)
    const updatedProfile = await extractProfileWithGemini(body.message, currentProfile);

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('API /api/extract error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your input.' },
      { status: 500 }
    );
  }
}

