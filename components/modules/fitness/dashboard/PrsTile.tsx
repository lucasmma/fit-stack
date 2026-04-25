"use client";

import { format, parseISO } from "date-fns";
import { ChartCard } from "@/components/charts/ChartCard";
import { EmptyChart } from "@/components/charts/EmptyChart";

interface PrsTileProps {
  prs: Array<{ exerciseId: string; exerciseName: string; weight: number; date: string }>;
}

export function PrsTile({ prs }: PrsTileProps) {
  return (
    <ChartCard title="Recent PRs" subtitle="All-time best working weight per exercise">
      {prs.length === 0 ? (
        <EmptyChart message="Log some working sets to see your PRs." />
      ) : (
        <ul className="divide-y divide-default-200">
          {prs.map((pr) => (
            <li key={pr.exerciseId} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">{pr.exerciseName}</p>
                <p className="text-xs text-default-500">
                  {format(parseISO(pr.date), "PPP")}
                </p>
              </div>
              <p className="text-base font-semibold tabular-nums">
                {pr.weight} kg
              </p>
            </li>
          ))}
        </ul>
      )}
    </ChartCard>
  );
}
