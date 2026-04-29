"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Card, CardBody, Chip } from "@heroui/react";
import { format, parseISO } from "date-fns";
import type {
  SessionSummaryDTO,
  SessionDetailDTO,
  SessionExerciseDTO,
} from "@/lib/schemas/fitness/session";
import type { WorkoutDetailDTO } from "@/lib/schemas/fitness/workout";
import { LineSeriesChart } from "@/components/charts/LineSeriesChart";
import { EmptyChart } from "@/components/charts/EmptyChart";
import { api } from "@/lib/api-client";

type ProgressionPoint = {
  date: string;
  topWeight: number;
  estimatedOneRm: number;
  volume: number;
};

type Prefetched = {
  sessionDetails?: Record<string, SessionDetailDTO>;
  workoutDetails?: Record<string, WorkoutDetailDTO>;
  progressions?: Record<string, ProgressionPoint[]>;
};

const PrefetchedCtx = createContext<Prefetched | null>(null);

interface WorkoutsSectionProps {
  sessions: SessionSummaryDTO[];
  activePlan: { name: string; workouts: Array<{ id: string; name: string }> } | null;
  expandable?: boolean;
  prefetched?: Prefetched;
}

export function WorkoutsSection({
  sessions,
  activePlan,
  expandable = false,
  prefetched,
}: WorkoutsSectionProps) {
  return (
    <PrefetchedCtx.Provider value={prefetched ?? null}>
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-default-500">
          Workouts
        </h2>
        {activePlan && <ActivePlanCard plan={activePlan} expandable={expandable} />}
        {sessions.length === 0 ? (
          <p className="text-sm text-default-500">No sessions logged yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {sessions.map((s) =>
              expandable ? (
                <ExpandableSessionCard key={s.id} session={s} />
              ) : (
                <SessionCard key={s.id} session={s} />
              ),
            )}
          </div>
        )}
      </section>
    </PrefetchedCtx.Provider>
  );
}

function ActivePlanCard({
  plan,
  expandable,
}: {
  plan: { name: string; workouts: Array<{ id: string; name: string }> };
  expandable: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <Card shadow="sm" className="mb-4">
      <CardBody className="gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-default-500">
            Active plan
          </p>
          <p className="text-lg font-semibold">{plan.name}</p>
          <div className="flex flex-wrap gap-2">
            {plan.workouts.map((w) => {
              const selected = selectedId === w.id;
              if (!expandable) {
                return (
                  <Chip key={w.id} size="sm" variant="flat">
                    {w.name}
                  </Chip>
                );
              }
              return (
                <Chip
                  key={w.id}
                  size="sm"
                  variant={selected ? "solid" : "flat"}
                  color={selected ? "primary" : "default"}
                  className="cursor-pointer"
                  onClick={() => setSelectedId((prev) => (prev === w.id ? null : w.id))}
                >
                  {w.name}
                </Chip>
              );
            })}
          </div>
        </div>
        {expandable && selectedId && <WorkoutExercisesPanel workoutId={selectedId} />}
      </CardBody>
    </Card>
  );
}

function WorkoutExercisesPanel({ workoutId }: { workoutId: string }) {
  const prefetched = useContext(PrefetchedCtx);
  const usePrefetched = prefetched?.workoutDetails !== undefined;
  const [detail, setDetail] = useState<WorkoutDetailDTO | null>(
    usePrefetched ? (prefetched!.workoutDetails![workoutId] ?? null) : null,
  );
  const [loading, setLoading] = useState(!usePrefetched);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (usePrefetched) {
      setDetail(prefetched!.workoutDetails![workoutId] ?? null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    setDetail(null);
    api.workouts
      .get(workoutId)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workoutId, usePrefetched, prefetched]);

  return (
    <div className="border-t border-default-200 pt-3">
      {loading && <p className="text-sm text-default-500">Loading exercises…</p>}
      {error && <p className="text-sm text-danger">Failed to load workout.</p>}
      {detail && detail.exercises.length === 0 && (
        <p className="text-sm text-default-500">No exercises in this workout.</p>
      )}
      {detail && detail.exercises.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {detail.exercises.map((pe) => (
            <ExerciseProgressionMini
              key={pe.id}
              exerciseId={pe.exerciseId}
              exerciseName={pe.exercise.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionSummaryRow({ session }: { session: SessionSummaryDTO }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">{session.workoutName}</p>
        <p className="text-xs text-default-500">
          {session.planName} · {format(parseISO(session.startedAt), "EEE d MMM")}
        </p>
      </div>
      <div className="flex gap-4 text-sm text-default-500">
        <span>
          {session.completedSetCount}/{session.totalSetCount} sets
        </span>
        <span>{session.totalVolume.toLocaleString()} kg</span>
      </div>
    </div>
  );
}

function SessionCard({ session }: { session: SessionSummaryDTO }) {
  return (
    <Card shadow="sm">
      <CardBody>
        <SessionSummaryRow session={session} />
      </CardBody>
    </Card>
  );
}

function ExpandableSessionCard({ session }: { session: SessionSummaryDTO }) {
  const prefetched = useContext(PrefetchedCtx);
  const usePrefetched = prefetched?.sessionDetails !== undefined;
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<SessionDetailDTO | null>(
    usePrefetched ? (prefetched!.sessionDetails![session.id] ?? null) : null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open || detail || usePrefetched) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    api.sessions
      .get(session.id)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, session.id, usePrefetched]);

  return (
    <Card shadow="sm">
      <CardBody className="gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-3 text-left"
          aria-expanded={open}
        >
          <Caret open={open} />
          <div className="flex-1">
            <SessionSummaryRow session={session} />
          </div>
        </button>
        {open && (
          <div className="border-t border-default-200 pt-3">
            {loading && <p className="text-sm text-default-500">Loading exercises…</p>}
            {error && <p className="text-sm text-danger">Failed to load session.</p>}
            {detail && detail.exercises.length === 0 && (
              <p className="text-sm text-default-500">No exercises in this session.</p>
            )}
            {detail && detail.exercises.length > 0 && (
              <div className="flex flex-col gap-3">
                {detail.exercises.map((se) => (
                  <SessionExerciseRow key={se.id} sessionExercise={se} />
                ))}
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function SessionExerciseRow({ sessionExercise }: { sessionExercise: SessionExerciseDTO }) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium">{sessionExercise.exercise.name}</p>
      {sessionExercise.sets.length === 0 ? (
        <p className="text-xs text-default-500">No sets recorded.</p>
      ) : (
        <ul className="flex flex-col gap-1 text-sm text-default-600">
          {sessionExercise.sets.map((set, idx) => {
            const reps = set.reps ?? 0;
            const weight = set.weight ?? 0;
            return (
              <li key={set.id} className="flex items-center gap-3">
                <span className="w-10 shrink-0 text-xs text-default-400">
                  {set.label ?? `Set ${idx + 1}`}
                </span>
                <span className="tabular-nums">
                  {reps} × {weight} kg
                </span>
                {!set.completed && (
                  <span className="text-xs text-default-400">(skipped)</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Caret({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 text-default-500 transition-transform ${open ? "rotate-90" : ""}`}
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function ExerciseProgressionMini({
  exerciseId,
  exerciseName,
}: {
  exerciseId: string;
  exerciseName: string;
}) {
  const prefetched = useContext(PrefetchedCtx);
  const usePrefetched = prefetched?.progressions !== undefined;
  const [data, setData] = useState<ProgressionPoint[] | null>(
    usePrefetched ? (prefetched!.progressions![exerciseId] ?? []) : null,
  );
  const [loading, setLoading] = useState(!usePrefetched);

  useEffect(() => {
    if (usePrefetched) {
      setData(prefetched!.progressions![exerciseId] ?? []);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api.dashboard
      .exerciseProgression(exerciseId)
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
  }, [exerciseId, usePrefetched, prefetched]);

  const points = (data ?? []).map((d) => ({
    x: format(parseISO(d.date), "MMM d"),
    y: d.volume,
  }));

  return (
    <div className="rounded-medium border border-default-200 p-3">
      <p className="mb-2 text-sm font-medium">{exerciseName}</p>
      {loading ? (
        <EmptyChart message="Loading…" />
      ) : (
        <LineSeriesChart data={points} unit=" kg" height={160} />
      )}
    </div>
  );
}
