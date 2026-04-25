"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { PlanDetailDTO } from "@/lib/schemas/fitness/plan";
import type { ExerciseDTO } from "@/lib/schemas/fitness/exercise";
import { api, ApiError } from "@/lib/api-client";
import { EmptyState } from "@/components/ui/EmptyState";
import { WorkoutCard } from "./WorkoutCard";
import { AddWorkoutDialog } from "./AddWorkoutDialog";

interface WorkoutsEditorProps {
  plan: PlanDetailDTO;
  catalog: ExerciseDTO[];
}

export function WorkoutsEditor({ plan, catalog }: WorkoutsEditorProps) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);

  const refresh = () => router.refresh();

  const createWorkout = async (values: { name: string; description?: string }) => {
    try {
      await api.workouts.create(plan.id, values);
      toast.success("Workout added");
      setAddOpen(false);
      refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not create workout");
    }
  };

  if (plan.workouts.length === 0) {
    return (
      <>
        <EmptyState
          icon="🏋️"
          title="No workouts yet"
          description="Add a workout like Push, Pull, or Legs to start filling in exercises."
          action={<Button color="primary" onPress={() => setAddOpen(true)}>Add workout</Button>}
        />
        <AddWorkoutDialog isOpen={addOpen} onClose={() => setAddOpen(false)} onCreate={createWorkout} />
      </>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Workouts</h2>
        <Button color="primary" variant="flat" size="sm" onPress={() => setAddOpen(true)}>
          Add workout
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        {plan.workouts.map((workout) => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            catalog={catalog}
            onChange={refresh}
          />
        ))}
      </div>
      <AddWorkoutDialog isOpen={addOpen} onClose={() => setAddOpen(false)} onCreate={createWorkout} />
    </>
  );
}
