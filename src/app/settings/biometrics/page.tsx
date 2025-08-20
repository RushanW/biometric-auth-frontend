export default function BiometricsSettingsPage() {
  return (
    <main className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="mb-2 text-lg font-medium">Biometric Settings</h2>
      <ul className="mt-3 list-inside list-disc text-sm text-neutral-400">
        <li>Re-enroll</li>
        <li>Delete biometric</li>
        <li>Bind device / Passkeys</li>
      </ul>
    </main>
  );
}