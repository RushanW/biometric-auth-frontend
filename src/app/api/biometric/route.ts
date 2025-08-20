import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // TODO: verify face match + liveness server-side

    const res = NextResponse.json({ token: 'mock-token', riskTier: 'low' }, { status: 200 });
    // mock session cookie (HttpOnly so client JS can’t touch it)
    res.headers.set(
      'Set-Cookie',
      `session=dev_mock; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
    );
    return res;
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
