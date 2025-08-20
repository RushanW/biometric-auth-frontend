// src/app/api/dev/clear-session/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const res = NextResponse.redirect(new URL('/', 'http://localhost'));
  res.headers.append('Set-Cookie', `session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  res.headers.append('Set-Cookie', `role=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  return res;
}
