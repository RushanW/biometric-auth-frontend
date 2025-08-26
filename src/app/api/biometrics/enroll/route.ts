import { NextResponse } from 'next/server';

// Force Node runtime (not edge)
export const runtime = 'nodejs';

const BACKEND_BASE_URL =
  process.env.BACKEND_BASE_URL || 'http://127.0.0.1:8000'; // FastAPI or other backend

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Basic validation
    if (!body?.userId || !body?.email || !Array.isArray(body?.descriptor)) {
      return NextResponse.json(
        { ok: false, error: 'invalid_payload' },
        { status: 400 }
      );
    }

    // Forward to your real backend
    const res = await fetch(`${BACKEND_BASE_URL}/api/biometrics/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { ok: false, error: 'backend_error', details: errText },
        { status: res.status }
      );
    }

    // Pass backend response back to client
    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ ok: true, backend: data });
  } catch (e: any) {
    console.error('[enroll] error:', e);
    return NextResponse.json(
      { ok: false, error: 'server_error', details: e.message },
      { status: 500 }
    );
  }
}

// (Optional) handle method not allowed for non-POST
export async function GET() {
  return NextResponse.json({ ok: true, info: 'Use POST to enroll.' });
}
