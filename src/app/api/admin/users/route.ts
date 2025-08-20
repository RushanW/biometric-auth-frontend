// src/app/api/admin/users/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const users = [
    { id: 'u_001', email: 'alice@example.com', enrolled: true, lastSeen: '2025-08-20 14:12', role: 'admin' },
    { id: 'u_002', email: 'bob@example.com', enrolled: true, lastSeen: '2025-08-21 09:05', role: 'user' },
    { id: 'u_003', email: 'carol@example.com', enrolled: false, lastSeen: '2025-08-19 18:27', role: 'user' },
  ];
  return NextResponse.json({ users });
}
