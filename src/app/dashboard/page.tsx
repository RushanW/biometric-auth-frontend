// src/app/dashboard/page.tsx
export default function Dashboard() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Welcome 👋</h1>

      <section className="grid gap-4 md:grid-cols-3">
        <Card title="Sign-in status">
          <p className="text-sm text-neutral-300">Session active (mock).</p>
          <p className="text-xs text-neutral-500 mt-1">Risk tier: <span className="text-emerald-300">low</span></p>
        </Card>
        <Card title="Biometric">
          <p className="text-sm text-neutral-300">Face ID enrolled (demo).</p>
          <a href="/settings/biometrics" className="text-xs text-blue-300 hover:underline mt-2 inline-block">Manage</a>
        </Card>
        <Card title="Security">
          <ul className="text-sm text-neutral-300 list-disc pl-5 space-y-1">
            <li>Passkey not set</li>
            <li>2FA via OTP available</li>
          </ul>
          <div className="mt-2 flex gap-2">
            <a href="/auth/passkey" className="text-xs rounded border border-neutral-700 px-2 py-1 hover:border-neutral-600">Add passkey</a>
            <a href="/auth/otp" className="text-xs rounded border border-neutral-700 px-2 py-1 hover:border-neutral-600">Setup OTP</a>
          </div>
        </Card>
      </section>

      <section className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
        <h2 className="mb-2 text-lg font-medium">Quick actions</h2>
        <div className="flex flex-wrap gap-2">
          <a href="/auth/face" className="rounded-lg border border-blue-500/40 bg-blue-600/15 px-3 py-2 text-blue-200 hover:bg-blue-600/25 text-sm">Face sign-in test</a>
          <a href="/consent" className="rounded-lg border border-neutral-700 px-3 py-2 hover:border-neutral-600 text-sm">Re-enroll face</a>
          <a href="/settings/biometrics" className="rounded-lg border border-neutral-700 px-3 py-2 hover:border-neutral-600 text-sm">Biometric settings</a>
        </div>
      </section>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      {children}
    </div>
  );
}
