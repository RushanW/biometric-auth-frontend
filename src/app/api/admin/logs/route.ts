// src/app/api/admin/logs/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const logs = [
    { time: '2025-08-21 09:05', actor: 'bob@example.com', action: 'face_sign_in', meta: 'risk_tier=low' },
    { time: '2025-08-20 20:11', actor: 'alice@example.com', action: 'delete_biometric', meta: 'user_initiated=true' },
    { time: '2025-08-20 14:12', actor: 'alice@example.com', action: 'admin_view', meta: '/admin/users' },
  ];
  return NextResponse.json({ logs });
}
