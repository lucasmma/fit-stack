"use client";

import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import type { SessionExerciseDTO, SessionSetDTO } from "@/lib/schemas/session";
import { SessionSetRow } from "./SessionSetRow";

interface SessionExerciseCardProps {
  exercise: SessionExerciseDTO;
  onSetUpdate: (setId: string, patch: Partial<SessionSetDTO>) => void | Promise<void>;
  onSetAdd: () => void | Promise<void>;
  onSetRemove: (setId: string) => void | Promise<void>;
  readOnly?: boolean;
}

export function SessionExerciseCard({
  exercise,
  onSetUpdate,
  onSetAdd,
  onSetRemove,
  readOnly,
}: SessionExerciseCardProps) {
  return (
    <Card shadow="sm">
      <CardHeader className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold">{exercise.exercise.name}</h3>
          {exercise.exercise.muscleGroup && (
            <p className="text-xs text-default-500">{exercise.exercise.muscleGroup}</p>
          )}
        </div>
      </CardHeader>
      <CardBody className="flex flex-col gap-2 pt-0">
        <div className="flex flex-col gap-2">
          {exercise.sets.map((set, i) => (
            <SessionSetRow
              key={set.id}
              set={set}
              index={i}
              onChange={onSetUpdate}
              onRemove={onSetRemove}
              readOnly={readOnly}
              canRemove={exercise.sets.length > 1}
            />
          ))}
        </div>
        {!readOnly && (
          <Button size="sm" variant="flat" onPress={() => void onSetAdd()} className="self-start">
            + Add set
          </Button>
        )}
      </CardBody>
    </Card>
  );
}
