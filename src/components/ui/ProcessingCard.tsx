export function ProcessingCard({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-300">
      {text}
    </div>
  );
}