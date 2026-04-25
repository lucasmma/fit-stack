"use client";

import type { ExerciseDTO } from "@/lib/schemas/exercise";
import { VolumeTile } from "./VolumeTile";
import { SessionsTile } from "./SessionsTile";
import { PrsTile } from "./PrsTile";
import { BodyWeightTile } from "./BodyWeightTile";
import { ExerciseProgressionTile } from "./ExerciseProgressionTile";

interface DashboardGridProps {
  volume: Array<{ weekStart: string; volume: number; sessions: number }>;
  prs: Array<{ exerciseId: string; exerciseName: string; weight: number; date: string }>;
  bodyWeight: Array<{ date: string; bodyWeightKg: number }>;
  exercises: ExerciseDTO[];
}

export function DashboardGrid({ volume, prs, bodyWeight, exercises }: DashboardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <SessionsTile data={volume} />
      <VolumeTile data={volume} />
      <ExerciseProgressionTile exercises={exercises} />
      <BodyWeightTile data={bodyWeight} />
      <PrsTile prs={prs} />
    </div>
  );
}
