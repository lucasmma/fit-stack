"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
} from "@heroui/react";
import { toast } from "sonner";
import type { WorkoutDetailDTO } from "@/lib/schemas/fitness/workout";
import type { ExerciseDTO } from "@/lib/schemas/fitness/exercise";
import { api, ApiError } from "@/lib/api-client";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlanExerciseRow } from "./PlanExerciseRow";
import { ExercisePicker } from "./ExercisePicker";

interface WorkoutCardProps {
  workout: WorkoutDetailDTO;
  catalog: ExerciseDTO[];
  onChange: () => void;
}

export function WorkoutCard({ workout, catalog, onChange }: WorkoutCardProps) {
  const pickerDisclosure = useDisclosure();
  const confirmDisclosure = useDisclosure();
  const [busy, setBusy] = useState(false);

  const addExercise = async (exerciseId: string) => {
    try {
      await api.workouts.addExercise(workout.id, {
        exerciseId,
        sets: [{ type: "WORKING", targetReps: 8 }],
      });
      toast.success("Exercise added");
      onChange();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not add exercise");
    }
  };

  const deleteWorkout = async () => {
    setBusy(true);
    try {
      await api.workouts.delete(workout.id);
      toast.success("Workout deleted");
      confirmDisclosure.onClose();
      onChange();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not delete workout");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card shadow="sm">
      <CardHeader className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">{workout.name}</h3>
          {workout.description && (
            <p className="text-sm text-default-500">{workout.description}</p>
          )}
        </div>
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button isIconOnly variant="light" aria-label="Workout actions">
              ⋯
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Workout actions">
            <DropdownItem key="delete" color="danger" onPress={confirmDisclosure.onOpen}>
              Delete workout
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </CardHeader>
      <CardBody className="gap-3 pt-0">
        {workout.exercises.length === 0 ? (
          <EmptyState
            title="No exercises yet"
            description="Add exercises from the catalog or create a custom one."
            action={
              <Button size="sm" color="primary" variant="flat" onPress={pickerDisclosure.onOpen}>
                Add exercise
              </Button>
            }
          />
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {workout.exercises.map((pe) => (
                <PlanExerciseRow key={pe.id} planExercise={pe} onChange={onChange} />
              ))}
            </div>
            <div>
              <Button size="sm" variant="flat" onPress={pickerDisclosure.onOpen}>
                Add exercise
              </Button>
            </div>
          </>
        )}
      </CardBody>

      <ExercisePicker
        isOpen={pickerDisclosure.isOpen}
        onClose={pickerDisclosure.onClose}
        catalog={catalog}
        onSelect={async (exercise) => {
          await addExercise(exercise.id);
          pickerDisclosure.onClose();
        }}
      />
      <ConfirmDialog
        isOpen={confirmDisclosure.isOpen}
        onClose={confirmDisclosure.onClose}
        onConfirm={deleteWorkout}
        title="Delete workout?"
        message="This removes the workout and all its exercise templates. Past sessions referencing it are preserved."
        confirmLabel="Delete"
        destructive
        isLoading={busy}
      />
    </Card>
  );
}
