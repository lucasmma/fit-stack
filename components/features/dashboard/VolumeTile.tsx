"use client";

import { format, parseISO } from "date-fns";
import { ChartCard } from "@/components/charts/ChartCard";
import { LineSeriesChart } from "@/components/charts/LineSeriesChart";

interface VolumeTileProps {
  data: Array<{ weekStart: string; volume: number }>;
}

export function VolumeTile({ data }: VolumeTileProps) {
  const points = data.map((d) => ({
    x: format(parseISO(d.weekStart), "MMM d"),
    y: d.volume,
  }));
  return (
    <ChartCard
      title="Volume per week"
      subtitle="Working sets only · reps × weight"
    >
      <LineSeriesChart data={points} unit=" kg" />
    </ChartCard>
  );
}
