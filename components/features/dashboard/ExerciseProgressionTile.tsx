"use client";

import { useEffect, useState } from "react";
import { Select, SelectItem } from "@heroui/react";
import { format, parseISO } from "date-fns";
import type { ExerciseDTO } from "@/lib/schemas/exercise";
import { ChartCard } from "@/components/charts/ChartCard";
import { LineSeriesChart } from "@/components/charts/LineSeriesChart";
import { EmptyChart } from "@/components/charts/EmptyChart";
import { api } from "@/lib/api-client";

export function ExerciseProgressionTile({ exercises }: { exercises: ExerciseDTO[] }) {
  const [selected, setSelected] = useState<string | null>(exercises[0]?.id ?? null);
  const [data, setData] = useState<
    Array<{ date: string; topWeight: number; estimatedOneRm: number }>
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selected) {
      setData([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api.dashboard
      .exerciseProgression(selected)
      .then((rows) => {
        if (!cancelled) setData(rows);
      })
      .catch(() => {
        if (!cancelled) setData([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const points = data.map((d) => ({
    x: format(parseISO(d.date), "MMM d"),
    y: d.estimatedOneRm,
  }));

  return (
    <ChartCard
      title="Exercise progression"
      subtitle="Estimated 1RM by day (Epley)"
      actions={
        <Select
          aria-label="Exercise"
          size="sm"
          variant="bordered"
          className="w-48"
          selectedKeys={selected ? new Set([selected]) : new Set()}
          onSelectionChange={(keys) => {
            const next = Array.from(keys as Set<string>)[0];
            setSelected(next ?? null);
          }}
        >
          {exercises.map((e) => (
            <SelectItem key={e.id}>{e.name}</SelectItem>
          ))}
        </Select>
      }
    >
      {loading ? (
        <EmptyChart message="Loading…" />
      ) : (
        <LineSeriesChart data={points} unit=" kg" />
      )}
    </ChartCard>
  );
}
