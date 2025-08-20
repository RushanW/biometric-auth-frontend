export function HintBar({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-sm text-neutral-300">
      {message}
    </div>
  );
}