export function EmptyChart({ message = "Not enough data yet" }: { message?: string }) {
  return (
    <div className="flex h-40 items-center justify-center text-sm text-default-400">
      {message}
    </div>
  );
}
