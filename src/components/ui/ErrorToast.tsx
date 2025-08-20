export function ErrorToast({ message }: { message: string }) {
  return (
    <div className="rounded bg-red-500/15 p-2 text-sm text-red-300">{message}</div>
  );
}