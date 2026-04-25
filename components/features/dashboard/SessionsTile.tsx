"use client";

import { format, parseISO } from "date-fns";
import { ChartCard } from "@/components/charts/ChartCard";
import { BarSeriesChart } from "@/components/charts/BarSeriesChart";

interface SessionsTileProps {
  data: Array<{ weekStart: string; sessions: number }>;
}

export function SessionsTile({ data }: SessionsTileProps) {
  const points = data.map((d) => ({
    x: format(parseISO(d.weekStart), "MMM d"),
    y: d.sessions,
  }));
  return (
    <ChartCard title="Sessions per week" subtitle="Last 12 weeks">
      <BarSeriesChart data={points} />
    </ChartCard>
  );
}
