// src/app/admin/page.tsx
export default async function AdminOverview() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/admin/stats`, { cache: 'no-store' });
  const stats = await res.json().catch(() => ({
    users: 0, enrollments: 0, faceSignInsToday: 0, deletionsThisWeek: 0,
  }));

  return (
    <section className="grid gap-4 md:grid-cols-4">
      <Stat label="Users" value={stats.users} />
      <Stat label="Enrollments" value={stats.enrollments} />
      <Stat label="Face sign-ins (24h)" value={stats.faceSignInsToday} />
      <Stat label="Deletions (7d)" value={stats.deletionsThisWeek} />
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}
