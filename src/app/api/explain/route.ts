import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limiter';
import { explainResultsWithGemini } from '@/lib/gemini';
import { SchemeMatch, Language } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting by IP
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
    const rateLimit = checkRateLimit(ip, 30, 60000);
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
    if (!body || !Array.isArray(body.matched)) {
      return NextResponse.json(
        { error: 'Invalid request body. "matched" array is required.' },
        { status: 400 }
      );
    }

    const matched: SchemeMatch[] = body.matched;
    const language: Language = body.language === 'en' ? 'en' : 'ta';

    // 3. Generate plain language explanation
    const explanation = await explainResultsWithGemini(matched, language);

    return NextResponse.json({
      success: true,
      explanation,
    });
  } catch (error) {
    console.error('API /api/explain error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while generating the explanation.' },
      { status: 500 }
    );
  }
}
