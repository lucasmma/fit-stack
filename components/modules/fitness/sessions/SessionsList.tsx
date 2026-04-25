"use client";

import type { SessionSummaryDTO } from "@/lib/schemas/fitness/session";
import { EmptyState } from "@/components/ui/EmptyState";
import { SessionSummaryCard } from "./SessionSummaryCard";

export function SessionsList({ sessions }: { sessions: SessionSummaryDTO[] }) {
  if (sessions.length === 0) {
    return (
      <EmptyState
        icon="🏋️"
        title="No sessions yet"
        description="Start a session to track reps and weights in real time."
      />
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {sessions.map((session) => (
        <SessionSummaryCard key={session.id} session={session} />
      ))}
    </div>
  );
}
