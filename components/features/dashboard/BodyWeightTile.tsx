"use client";

import { format, parseISO } from "date-fns";
import { ChartCard } from "@/components/charts/ChartCard";
import { LineSeriesChart } from "@/components/charts/LineSeriesChart";

interface BodyWeightTileProps {
  data: Array<{ date: string; bodyWeightKg: number }>;
}

export function BodyWeightTile({ data }: BodyWeightTileProps) {
  const points = data.map((d) => ({
    x: format(parseISO(d.date), "MMM d"),
    y: d.bodyWeightKg,
  }));
  return (
    <ChartCard title="Body weight" subtitle="From your progress photos">
      <LineSeriesChart data={points} unit=" kg" />
    </ChartCard>
  );
}
