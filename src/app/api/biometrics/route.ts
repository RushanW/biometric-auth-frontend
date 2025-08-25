// app/api/biometrics/enroll/route.ts
import { NextResponse } from 'next/server';

// Make sure this runs on Node (not edge), just to keep things simple.
export const runtime = 'nodejs';
// If you enabled static export anywhere, force dynamic:
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ ok: true, info: 'Use POST to enroll.' });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.userId || !body?.email || !Array.isArray(body?.descriptor)) {
      return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
    }
    // TODO: write to your DB here
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
