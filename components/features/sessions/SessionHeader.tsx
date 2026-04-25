"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { formatDuration } from "@/lib/utils/format";

interface SessionHeaderProps {
  planName: string;
  workoutName: string;
  startedAt: Date;
  finishedAt: Date | null;
  summary: { completed: number; total: number; volume: number };
}

export function SessionHeader({
  planName,
  workoutName,
  startedAt,
  finishedAt,
  summary,
}: SessionHeaderProps) {
  const elapsed = useLiveDuration(startedAt, finishedAt);
  return (
    <header className="rounded-large border border-default-200 bg-content1 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-default-500">
        {planName}
      </p>
      <h1 className="mt-1 text-xl font-semibold tracking-tight">{workoutName}</h1>
      <p className="mt-1 text-sm text-default-500">
        Started {format(startedAt, "EEE d MMM HH:mm")}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Duration" value={elapsed} />
        <Stat label="Sets" value={`${summary.completed}/${summary.total}`} />
        <Stat label="Volume" value={`${summary.volume.toLocaleString()} kg`} />
      </div>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-medium bg-default-100 px-2 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-default-500">
        {label}
      </p>
      <p className="text-base font-semibold">{value}</p>
    </div>
  );
}

function useLiveDuration(startedAt: Date, finishedAt: Date | null) {
  const [now, setNow] = useState(() => finishedAt ?? new Date());
  useEffect(() => {
    if (finishedAt) {
      setNow(finishedAt);
      return;
    }
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, [finishedAt]);
  return formatDuration(startedAt, finishedAt ?? now);
}
