"use client";

import Image from "next/image";
import { Chip } from "@heroui/react";
import type { PhotoDTO } from "@/lib/schemas/fitness/photo";
import type { SessionSummaryDTO, SessionDetailDTO } from "@/lib/schemas/fitness/session";
import type { WorkoutDetailDTO } from "@/lib/schemas/fitness/workout";
import { SHARE_SCOPE_LABEL, type ShareScope } from "@/lib/schemas/fitness/share";
import { VolumeTile } from "@/components/modules/fitness/dashboard/VolumeTile";
import { SessionsTile } from "@/components/modules/fitness/dashboard/SessionsTile";
import { PrsTile } from "@/components/modules/fitness/dashboard/PrsTile";
import { BodyWeightTile } from "@/components/modules/fitness/dashboard/BodyWeightTile";
import { ExerciseProgressionTile } from "@/components/modules/fitness/dashboard/ExerciseProgressionTile";
import { WorkoutsSection } from "@/components/modules/fitness/dashboard/WorkoutsSection";

type ProgressionPoint = {
  date: string;
  topWeight: number;
  estimatedOneRm: number;
  volume: number;
};

interface SharePageProps {
  name: string | null;
  scope: ShareScope;
  progress: {
    volume: Array<{ weekStart: string; volume: number; sessions: number }>;
    prs: Array<{ exerciseId: string; exerciseName: string; weight: number; date: string }>;
    bodyWeight: Array<{ date: string; bodyWeightKg: number }>;
    photos: PhotoDTO[];
    exerciseProgressions: Array<{
      exerciseId: string;
      exerciseName: string;
      points: ProgressionPoint[];
    }>;
  } | null;
  workouts: {
    sessions: SessionSummaryDTO[];
    activePlan: { name: string; workouts: Array<{ id: string; name: string }> } | null;
    sessionDetails: Record<string, SessionDetailDTO>;
    workoutDetails: Record<string, WorkoutDetailDTO>;
  } | null;
}

export function SharePage({ name, scope, progress, workouts }: SharePageProps) {
  const progressionExercises =
    progress?.exerciseProgressions.map((p) => ({
      id: p.exerciseId,
      name: p.exerciseName,
    })) ?? [];
  const progressionPrefetched: Record<string, ProgressionPoint[]> = {};
  for (const p of progress?.exerciseProgressions ?? []) {
    progressionPrefetched[p.exerciseId] = p.points;
  }

  return (
    <div className="min-h-screen bg-default-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {name ?? "Shared progress"}
              </h1>
              <Chip size="sm" variant="flat">
                {SHARE_SCOPE_LABEL[scope]}
              </Chip>
            </div>
            <p className="mt-1 text-sm text-default-500">Read-only view from personal-hq.</p>
          </div>
        </header>

        {progress && (
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-default-500">
              Progress
            </h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <SessionsTile data={progress.volume} />
              <VolumeTile data={progress.volume} />
              {progressionExercises.length > 0 && (
                <ExerciseProgressionTile
                  exercises={progressionExercises}
                  prefetched={progressionPrefetched}
                />
              )}
              <BodyWeightTile data={progress.bodyWeight} />
              <PrsTile prs={progress.prs} />
            </div>

            {progress.photos.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-semibold">Photos</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                  {progress.photos.slice(0, 12).map((photo) => (
                    <div
                      key={photo.id}
                      className="relative aspect-[3/4] overflow-hidden rounded-medium border border-default-200"
                    >
                      <Image
                        src={photo.url}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 25vw, 16vw"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {workouts && (
          <WorkoutsSection
            sessions={workouts.sessions}
            activePlan={workouts.activePlan}
            expandable
            prefetched={{
              sessionDetails: workouts.sessionDetails,
              workoutDetails: workouts.workoutDetails,
              progressions: progressionPrefetched,
            }}
          />
        )}
      </div>
    </div>
  );
}
