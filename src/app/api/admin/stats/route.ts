// src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // mock numbers; replace with real DB queries
  return NextResponse.json({
    users: 1287,
    enrollments: 1043,
    faceSignInsToday: 312,
    deletionsThisWeek: 7,
  });
}
