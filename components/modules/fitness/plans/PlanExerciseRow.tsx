"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { toast } from "sonner";
import type { PlanExerciseDTO } from "@/lib/schemas/fitness/workout";
import { api, ApiError } from "@/lib/api-client";
import { PlanSetRow } from "./PlanSetRow";

interface PlanExerciseRowProps {
  planExercise: PlanExerciseDTO;
  onChange: () => void;
}

export function PlanExerciseRow({ planExercise, onChange }: PlanExerciseRowProps) {
  const [busy, setBusy] = useState(false);

  const addSet = async () => {
    setBusy(true);
    try {
      await api.workouts.addSet(planExercise.id, { type: "WORKING" });
      onChange();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not add set");
    } finally {
      setBusy(false);
    }
  };

  const removeExercise = async () => {
    setBusy(true);
    try {
      await api.workouts.removeExercise(planExercise.id);
      toast.success("Exercise removed");
      onChange();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not remove exercise");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-medium border border-default-200 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="font-medium">{planExercise.exercise.name}</p>
          {planExercise.exercise.muscleGroup && (
            <p className="text-xs text-default-500">{planExercise.exercise.muscleGroup}</p>
          )}
        </div>
        <Button
          size="sm"
          variant="light"
          color="danger"
          onPress={removeExercise}
          isDisabled={busy}
        >
          Remove
        </Button>
      </div>
      <div className="flex flex-col gap-1.5">
        {planExercise.sets.map((set, index) => (
          <PlanSetRow
            key={set.id}
            set={set}
            index={index}
            onChange={onChange}
            canDelete={planExercise.sets.length > 1}
          />
        ))}
      </div>
      <div className="mt-2">
        <Button size="sm" variant="flat" onPress={addSet} isDisabled={busy}>
          + Add set
        </Button>
      </div>
    </div>
  );
}
