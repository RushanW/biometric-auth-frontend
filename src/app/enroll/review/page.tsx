export default function ReviewPage() {
  return (
    <main className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="mb-2 text-lg font-medium">Processing on-device…</h2>
      <p className="text-sm text-neutral-400">(Stub) We’ll extract features and prepare your enrollment.</p>
      <div className="mt-4">
        <a className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700" href="/enroll/success">Finish</a>
      </div>
    </main>
  );
}