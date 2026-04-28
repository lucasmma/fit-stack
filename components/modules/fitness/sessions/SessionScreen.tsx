"use client";

import { useMemo, useState } from "react";
import { Button, Chip, useDisclosure } from "@heroui/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import type { SessionDetailDTO, SessionSetDTO } from "@/lib/schemas/fitness/session";
import type { ExerciseDTO } from "@/lib/schemas/fitness/exercise";
import { api, ApiError } from "@/lib/api-client";
import { ExercisePicker } from "@/components/modules/fitness/plans/ExercisePicker";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SessionExerciseCard } from "./SessionExerciseCard";
import { SessionHeader } from "./SessionHeader";
import { formatDuration } from "@/lib/utils/format";

interface SessionScreenProps {
  initialSession: SessionDetailDTO;
  catalog: ExerciseDTO[];
}

type SetPatch = Partial<
  Pick<SessionSetDTO, "reps" | "weight" | "rpe" | "completed" | "notes">
>;

export function SessionScreen({ initialSession, catalog }: SessionScreenProps) {
  const router = useRouter();
  const [session, setSession] = useState(initialSession);
  const pickerDisclosure = useDisclosure();
  const finishDisclosure = useDisclosure();
  const [finishing, setFinishing] = useState(false);

  const isFinished = !!session.finishedAt;

  const summary = useMemo(() => {
    const flat = session.exercises.flatMap((e) => e.sets);
    const completed = flat.filter((s) => s.completed).length;
    const working = flat.filter((s) => s.completed && s.type === "WORKING");
    const volume = working.reduce((sum, s) => sum + (s.reps ?? 0) * (s.weight ?? 0), 0);
    return { completed, total: flat.length, volume };
  }, [session]);

  const updateSet = async (setId: string, patch: SetPatch) => {
    // Optimistic update
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((e) => ({
        ...e,
        sets: e.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
      })),
    }));
    try {
      const updated = await api.sessions.updateSet(setId, patch);
      setSession((prev) => ({
        ...prev,
        exercises: prev.exercises.map((e) => ({
          ...e,
          sets: e.sets.map((s) =>
            s.id === setId
              ? { ...updated, previousReps: s.previousReps, previousWeight: s.previousWeight }
              : s,
          ),
        })),
      }));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save set");
      router.refresh();
    }
  };

  const addSet = async (sessionExerciseId: string) => {
    try {
      const created = await api.sessions.addSet(sessionExerciseId, { type: "WORKING" });
      setSession((prev) => ({
        ...prev,
        exercises: prev.exercises.map((e) =>
          e.id === sessionExerciseId ? { ...e, sets: [...e.sets, created] } : e,
        ),
      }));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not add set");
    }
  };

  const removeSet = async (setId: string) => {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((e) => ({
        ...e,
        sets: e.sets.filter((s) => s.id !== setId),
      })),
    }));
    try {
      await api.sessions.deleteSet(setId);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not remove set");
      router.refresh();
    }
  };

  const addExercise = async (exercise: ExerciseDTO) => {
    try {
      const created = await api.sessions.addExercise(session.id, { exerciseId: exercise.id });
      setSession((prev) => ({ ...prev, exercises: [...prev.exercises, created] }));
      pickerDisclosure.onClose();
      toast.success("Exercise added");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not add exercise");
    }
  };

  const finish = async () => {
    setFinishing(true);
    try {
      await api.sessions.finish(session.id);
      toast.success("Session finished");
      router.push("/fitness/sessions");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not finish session");
      setFinishing(false);
    }
  };

  return (
    <div className="pb-24">
      <SessionHeader
        planName={session.planName}
        workoutName={session.workoutName}
        startedAt={new Date(session.startedAt)}
        finishedAt={session.finishedAt ? new Date(session.finishedAt) : null}
        summary={summary}
      />

      <div className="mt-6 flex flex-col gap-4">
        {session.exercises.map((se) => (
          <SessionExerciseCard
            key={se.id}
            exercise={se}
            onSetUpdate={updateSet}
            onSetAdd={() => addSet(se.id)}
            onSetRemove={removeSet}
            readOnly={isFinished}
          />
        ))}
      </div>

      {!isFinished && (
        <div className="mt-6 flex flex-col gap-3">
          <Button variant="flat" onPress={pickerDisclosure.onOpen}>
            + Add exercise
          </Button>
        </div>
      )}

      {isFinished && (
        <div className="mt-6 rounded-medium bg-default-100 p-4 text-sm">
          <div className="flex items-center gap-2">
            <Chip color="success" size="sm" variant="flat">
              Completed
            </Chip>
            <span className="text-default-600">
              Finished at{" "}
              {format(new Date(session.finishedAt!), "EEE d MMM HH:mm")} ·{" "}
              {formatDuration(new Date(session.startedAt), new Date(session.finishedAt!))}
            </span>
          </div>
        </div>
      )}

      {!isFinished && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4 pt-2">
          <div className="pointer-events-auto w-full max-w-md">
            <Button
              color="primary"
              size="lg"
              fullWidth
              onPress={finishDisclosure.onOpen}
              className="shadow-lg"
            >
              Finish workout
            </Button>
          </div>
        </div>
      )}

      <ExercisePicker
        isOpen={pickerDisclosure.isOpen}
        onClose={pickerDisclosure.onClose}
        catalog={catalog}
        onSelect={addExercise}
      />

      <ConfirmDialog
        isOpen={finishDisclosure.isOpen}
        onClose={finishDisclosure.onClose}
        title="Finish workout?"
        message={`You've completed ${summary.completed} of ${summary.total} sets for a total volume of ${summary.volume.toLocaleString()} kg.`}
        confirmLabel="Finish"
        onConfirm={finish}
        isLoading={finishing}
      />
    </div>
  );
}
