"use client";

import { useEffect, useState } from "react";
import { Button, Input, Chip } from "@heroui/react";
import { cn } from "@/lib/utils/cn";
import { SET_TYPE_LABEL } from "@/lib/schemas/shared/common";
import type { SessionSetDTO } from "@/lib/schemas/fitness/session";

interface SessionSetRowProps {
  set: SessionSetDTO;
  index: number;
  onChange: (setId: string, patch: Partial<SessionSetDTO>) => void | Promise<void>;
  onRemove: (setId: string) => void | Promise<void>;
  readOnly?: boolean;
  canRemove: boolean;
}

export function SessionSetRow({
  set,
  index,
  onChange,
  onRemove,
  readOnly,
  canRemove,
}: SessionSetRowProps) {
  const [reps, setReps] = useState<string>(set.reps == null ? "" : String(set.reps));
  const [weight, setWeight] = useState<string>(set.weight == null ? "" : String(set.weight));

  // Sync from upstream when completed toggling etc. Avoid fighting the user while they type.
  useEffect(() => {
    setReps(set.reps == null ? "" : String(set.reps));
  }, [set.reps]);
  useEffect(() => {
    setWeight(set.weight == null ? "" : String(set.weight));
  }, [set.weight]);

  const commitReps = () => {
    const next = reps === "" ? null : Number(reps);
    if (next !== set.reps) void onChange(set.id, { reps: next });
  };
  const commitWeight = () => {
    const next = weight === "" ? null : Number(weight);
    if (next !== set.weight) void onChange(set.id, { weight: next });
  };

  const toggle = () => {
    // Require numeric inputs before marking done for the first time
    if (!set.completed && (reps === "" || weight === "")) return;
    void onChange(set.id, { completed: !set.completed });
  };

  const chipColor =
    set.type === "WORKING" ? "primary" : set.type === "WARMUP" ? "warning" : "default";

  return (
    <div
      className={cn(
        "grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2 rounded-medium border p-2 transition-colors",
        set.completed
          ? "border-success-500/40 bg-success-500/5"
          : "border-default-200 bg-content1",
      )}
    >
      <div className="flex w-16 flex-col items-start gap-0.5">
        <span className="text-sm font-semibold tabular-nums">#{index + 1}</span>
        <Chip size="sm" variant="flat" color={chipColor as "primary" | "warning" | "default"}>
          {SET_TYPE_LABEL[set.type]}
        </Chip>
      </div>
      <Input
        aria-label="Reps"
        type="number"
        inputMode="numeric"
        size="md"
        min={0}
        variant="bordered"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        onBlur={commitReps}
        isDisabled={readOnly}
        endContent={<span className="text-xs text-default-500">reps</span>}
      />
      <Input
        aria-label="Weight"
        type="number"
        inputMode="decimal"
        step="0.5"
        size="md"
        min={0}
        variant="bordered"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        onBlur={commitWeight}
        isDisabled={readOnly}
        endContent={<span className="text-xs text-default-500">kg</span>}
      />
      {readOnly ? (
        <Chip
          color={set.completed ? "success" : "default"}
          variant={set.completed ? "flat" : "bordered"}
          size="sm"
        >
          {set.completed ? "Done" : "Skipped"}
        </Chip>
      ) : (
        <div className="flex items-center gap-1">
          <Button
            isIconOnly
            size="sm"
            variant={set.completed ? "solid" : "flat"}
            color={set.completed ? "success" : "default"}
            aria-label={set.completed ? "Mark as not done" : "Mark as done"}
            onPress={toggle}
          >
            ✓
          </Button>
          {canRemove && (
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              aria-label="Remove set"
              onPress={() => void onRemove(set.id)}
            >
              ✕
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
