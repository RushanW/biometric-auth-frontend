import { NextResponse } from 'next/server';

// Optional: force Node runtime (not edge)
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Basic validation
    if (!body?.userId || !body?.email || !Array.isArray(body?.descriptor)) {
      return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
    }

    // TODO: persist to your DB here
    console.log('[enroll] saving', {
      userId: body.userId,
      name: body.name,
      email: body.email,
      descriptorLen: body.descriptor.length,
      hasSnapshot: !!body.snapshot,
      createdAt: body.createdAt,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

// (Optional) handle method not allowed for non-POST
export async function GET() {
  return NextResponse.json({ ok: true, info: 'Use POST to enroll.' });
}
