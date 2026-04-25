"use client";

import Link from "next/link";
import { Card, CardBody, Chip } from "@heroui/react";
import { format } from "date-fns";
import type { SessionSummaryDTO } from "@/lib/schemas/session";
import { formatDuration } from "@/lib/utils/format";

export function SessionSummaryCard({ session }: { session: SessionSummaryDTO }) {
  const startedAt = new Date(session.startedAt);
  const finishedAt = session.finishedAt ? new Date(session.finishedAt) : null;
  const isActive = !finishedAt;

  return (
    <Card as={Link} href={`/sessions/${session.id}`} isPressable shadow="sm">
      <CardBody className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold">{session.workoutName}</h3>
            {isActive && (
              <Chip color="warning" size="sm" variant="flat">
                In progress
              </Chip>
            )}
          </div>
          <p className="text-sm text-default-500">
            {session.planName} · {format(startedAt, "EEE d MMM")} ·{" "}
            {format(startedAt, "HH:mm")}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-default-500">
          <span>{session.completedSetCount}/{session.totalSetCount} sets</span>
          <span>{session.totalVolume.toLocaleString()} kg vol</span>
          <span>{formatDuration(startedAt, finishedAt)}</span>
        </div>
      </CardBody>
    </Card>
  );
}
