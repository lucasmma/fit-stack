"use client";

import Image from "next/image";
import { Card, CardBody, Chip } from "@heroui/react";
import { format, parseISO } from "date-fns";
import type { PhotoDTO } from "@/lib/schemas/photo";
import type { SessionSummaryDTO } from "@/lib/schemas/session";
import { SHARE_SCOPE_LABEL, type ShareScope } from "@/lib/schemas/share";
import { VolumeTile } from "@/components/features/dashboard/VolumeTile";
import { SessionsTile } from "@/components/features/dashboard/SessionsTile";
import { PrsTile } from "@/components/features/dashboard/PrsTile";
import { BodyWeightTile } from "@/components/features/dashboard/BodyWeightTile";
import { ExerciseProgressionTile } from "@/components/features/dashboard/ExerciseProgressionTile";

type ProgressionPoint = { date: string; topWeight: number; estimatedOneRm: number };

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
            <p className="mt-1 text-sm text-default-500">Read-only view from fit-stack.</p>
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
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-default-500">
              Workouts
            </h2>
            {workouts.activePlan && (
              <Card shadow="sm" className="mb-4">
                <CardBody className="gap-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-default-500">
                    Active plan
                  </p>
                  <p className="text-lg font-semibold">{workouts.activePlan.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {workouts.activePlan.workouts.map((w) => (
                      <Chip key={w.id} size="sm" variant="flat">
                        {w.name}
                      </Chip>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
            {workouts.sessions.length === 0 ? (
              <p className="text-sm text-default-500">No sessions logged yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {workouts.sessions.map((s) => (
                  <Card key={s.id} shadow="sm">
                    <CardBody className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">{s.workoutName}</p>
                        <p className="text-xs text-default-500">
                          {s.planName} · {format(parseISO(s.startedAt), "EEE d MMM")}
                        </p>
                      </div>
                      <div className="flex gap-4 text-sm text-default-500">
                        <span>{s.completedSetCount}/{s.totalSetCount} sets</span>
                        <span>{s.totalVolume.toLocaleString()} kg</span>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
