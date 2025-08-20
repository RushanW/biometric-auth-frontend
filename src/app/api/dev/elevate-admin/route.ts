// src/app/api/dev/elevate-admin/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const res = NextResponse.redirect(new URL('/admin', 'http://localhost')); // Next rewrites host
  res.headers.append('Set-Cookie', `session=dev_mock; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
  res.headers.append('Set-Cookie', `role=admin; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
  return res;
}
