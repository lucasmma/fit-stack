export function formatWeight(kg: number | null | undefined): string {
  if (kg === null || kg === undefined) return "—";
  return `${Number(kg).toFixed(kg % 1 === 0 ? 0 : 1)} kg`;
}

export function formatReps(reps: number | null | undefined): string {
  if (reps === null || reps === undefined) return "—";
  return `${reps}`;
}

export function formatDuration(startedAt: Date, finishedAt?: Date | null): string {
  const end = finishedAt ?? new Date();
  const ms = end.getTime() - startedAt.getTime();
  const minutes = Math.max(0, Math.round(ms / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem === 0 ? `${hours}h` : `${hours}h ${rem}m`;
}
