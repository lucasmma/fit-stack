"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";
import { Button, Card, CardBody } from "@heroui/react";
import { useRouter } from "next/navigation";
import type { SessionSummaryDTO } from "@/lib/schemas/fitness/session";
import { cn } from "@/lib/utils/cn";
import { DaySessionsList } from "./DaySessionsList";

interface CalendarViewProps {
  month: Date;
  sessions: SessionSummaryDTO[];
}

export function CalendarView({ month, sessions }: CalendarViewProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Date | null>(null);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = useMemo(
    () => eachDayOfInterval({ start: gridStart, end: gridEnd }),
    [gridStart, gridEnd],
  );

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, SessionSummaryDTO[]>();
    for (const session of sessions) {
      const key = format(parseISO(session.startedAt), "yyyy-MM-dd");
      const existing = map.get(key) ?? [];
      existing.push(session);
      map.set(key, existing);
    }
    return map;
  }, [sessions]);

  const go = (delta: number) => {
    const next = delta < 0 ? subMonths(month, 1) : addMonths(month, 1);
    router.push(`/fitness/calendar?month=${format(next, "yyyy-MM")}`);
  };

  const weekdayHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const selectedKey = selected ? format(selected, "yyyy-MM-dd") : null;
  const selectedSessions = selectedKey ? sessionsByDay.get(selectedKey) ?? [] : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{format(month, "MMMM yyyy")}</h2>
        <div className="flex gap-2">
          <Button isIconOnly variant="flat" onPress={() => go(-1)} aria-label="Previous month">
            ←
          </Button>
          <Button variant="flat" onPress={() => router.push("/fitness/calendar")}>
            Today
          </Button>
          <Button isIconOnly variant="flat" onPress={() => go(1)} aria-label="Next month">
            →
          </Button>
        </div>
      </div>
      <Card shadow="sm">
        <CardBody>
          <div className="grid grid-cols-7 gap-1 text-xs font-medium uppercase tracking-wide text-default-500">
            {weekdayHeaders.map((d) => (
              <div key={d} className="px-1 py-2 text-center">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const daySessions = sessionsByDay.get(key) ?? [];
              const outside = !isSameMonth(day, month);
              const selectedHere = selected && isSameDay(day, selected);
              return (
                <button
                  key={key}
                  onClick={() => setSelected(day)}
                  className={cn(
                    "aspect-square rounded-medium border p-1 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                    outside
                      ? "border-transparent text-default-300"
                      : "border-default-200 hover:bg-default-100",
                    selectedHere && "border-primary bg-primary/10",
                    isSameDay(day, new Date()) && !selectedHere && "border-primary/40",
                  )}
                  aria-label={`${format(day, "PPP")}, ${daySessions.length} session${daySessions.length === 1 ? "" : "s"}`}
                >
                  <span className="text-xs font-medium">{format(day, "d")}</span>
                  {daySessions.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-0.5">
                      {daySessions.slice(0, 3).map((s) => (
                        <span
                          key={s.id}
                          className="h-1.5 w-1.5 rounded-full bg-primary"
                          aria-hidden
                        />
                      ))}
                      {daySessions.length > 3 && (
                        <span className="text-[10px] text-default-500">+{daySessions.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardBody>
      </Card>
      {selected && (
        <DaySessionsList
          date={selected}
          sessions={selectedSessions}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
