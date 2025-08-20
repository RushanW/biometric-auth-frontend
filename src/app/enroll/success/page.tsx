export default function EnrollSuccessPage() {
  return (
    <main className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="mb-2 text-lg font-medium">Enrollment complete</h2>
      <p className="text-sm text-neutral-400">You can now sign in with face + liveness.</p>
      <div className="mt-4 flex gap-3">
        <a className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700" href="/">Go to Home</a>
        <a className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700" href="/settings/biometrics">Manage Settings</a>
      </div>
    </main>
  );
}
