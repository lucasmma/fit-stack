"use client";

import { Button, Card, CardBody } from "@heroui/react";
import { format } from "date-fns";
import type { SessionSummaryDTO } from "@/lib/schemas/session";
import { SessionSummaryCard } from "@/components/features/sessions/SessionSummaryCard";

interface DaySessionsListProps {
  date: Date;
  sessions: SessionSummaryDTO[];
  onClose: () => void;
}

export function DaySessionsList({ date, sessions, onClose }: DaySessionsListProps) {
  return (
    <section className="mt-2">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold">{format(date, "EEEE, d MMM")}</h3>
        <Button size="sm" variant="light" onPress={onClose}>
          Close
        </Button>
      </div>
      {sessions.length === 0 ? (
        <Card shadow="sm">
          <CardBody>
            <p className="text-sm text-default-500">No sessions logged on this day.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {sessions.map((s) => (
            <SessionSummaryCard key={s.id} session={s} />
          ))}
        </div>
      )}
    </section>
  );
}
