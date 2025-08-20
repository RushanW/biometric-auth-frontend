// src/app/admin/logs/page.tsx
export default async function AdminLogsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/admin/logs`, { cache: 'no-store' });
  const { logs = [] } = await res.json().catch(() => ({ logs: [] }));

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <h2 className="text-lg font-medium mb-2">Audit Logs</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-neutral-400">
              <th className="border-b border-neutral-800 px-3 py-2 text-left">Time</th>
              <th className="border-b border-neutral-800 px-3 py-2 text-left">Actor</th>
              <th className="border-b border-neutral-800 px-3 py-2 text-left">Action</th>
              <th className="border-b border-neutral-800 px-3 py-2 text-left">Meta</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l: any, i: number) => (
              <tr key={i} className="odd:bg-white/[0.02]">
                <td className="px-3 py-2">{l.time}</td>
                <td className="px-3 py-2">{l.actor}</td>
                <td className="px-3 py-2">{l.action}</td>
                <td className="px-3 py-2 text-neutral-400">{l.meta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
