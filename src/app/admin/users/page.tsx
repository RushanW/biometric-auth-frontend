// src/app/admin/users/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';

type AdminUser = { id: string; email: string; enrolled: boolean; lastSeen: string; role: 'user' | 'admin' };

export default function AdminUsersPage() {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      const json = await res.json();
      setData(json.users ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(u =>
      u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q)
    );
  }, [query, data]);

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-medium">Users</h2>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by email or id…"
          className="rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none placeholder:text-neutral-500"
        />
      </div>

      {loading ? (
        <p className="text-sm text-neutral-400">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-neutral-400">
                <th className="border-b border-neutral-800 px-3 py-2 text-left">ID</th>
                <th className="border-b border-neutral-800 px-3 py-2 text-left">Email</th>
                <th className="border-b border-neutral-800 px-3 py-2">Role</th>
                <th className="border-b border-neutral-800 px-3 py-2">Enrolled</th>
                <th className="border-b border-neutral-800 px-3 py-2">Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="odd:bg-white/[0.02]">
                  <td className="px-3 py-2 font-mono text-xs">{u.id}</td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2 text-center">{u.role}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`rounded px-2 py-0.5 text-xs ${u.enrolled ? 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400 border border-neutral-700'}`}>
                      {u.enrolled ? 'yes' : 'no'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-neutral-400">{u.lastSeen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
