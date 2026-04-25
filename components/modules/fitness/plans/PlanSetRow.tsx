"use client";

import { useState } from "react";
import { Select, SelectItem, Input, Textarea, Button } from "@heroui/react";
import { toast } from "sonner";
import type { PlanSetDTO } from "@/lib/schemas/fitness/workout";
import { SET_TYPE_LABEL, type SetType } from "@/lib/schemas/shared/common";
import { api, ApiError } from "@/lib/api-client";

interface PlanSetRowProps {
  set: PlanSetDTO;
  index: number;
  onChange: () => void;
  canDelete: boolean;
}

const SET_TYPE_OPTIONS = Object.entries(SET_TYPE_LABEL) as Array<[SetType, string]>;

type NumOrEmpty = number | "";

const toNumOrEmpty = (n: number | null): NumOrEmpty => (n === null ? "" : n);

export function PlanSetRow({ set, index, onChange, canDelete }: PlanSetRowProps) {
  const [type, setType] = useState<SetType>(set.type);
  const [repsMin, setRepsMin] = useState<NumOrEmpty>(toNumOrEmpty(set.targetReps));
  const [repsMax, setRepsMax] = useState<NumOrEmpty>(toNumOrEmpty(set.targetRepsMax));
  const [weight, setWeight] = useState<NumOrEmpty>(
    set.targetWeight === null ? "" : set.targetWeight,
  );
  const [notes, setNotes] = useState(set.notes ?? "");
  const [busy, setBusy] = useState(false);

  const commit = async (patch: Record<string, unknown>) => {
    setBusy(true);
    try {
      await api.workouts.updateSet(set.id, patch);
      onChange();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.workouts.removeSet(set.id);
      onChange();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not remove set");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-medium bg-default-50 p-2">
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-end gap-2">
        <span className="w-6 text-sm font-medium tabular-nums text-default-500">
          {index + 1}
        </span>
        <Select
          aria-label="Set type"
          size="sm"
          variant="bordered"
          selectedKeys={new Set([type])}
          onSelectionChange={(keys) => {
            const next = Array.from(keys as Set<SetType>)[0];
            if (next) {
              setType(next);
              void commit({ type: next });
            }
          }}
          className="min-w-32"
        >
          {SET_TYPE_OPTIONS.map(([value, label]) => (
            <SelectItem key={value}>{label}</SelectItem>
          ))}
        </Select>
        <Input
          aria-label="Min reps"
          size="sm"
          variant="bordered"
          type="number"
          inputMode="numeric"
          min={0}
          value={repsMin === "" ? "" : String(repsMin)}
          onChange={(e) =>
            setRepsMin(e.target.value === "" ? "" : Number(e.target.value))
          }
          onBlur={() =>
            void commit({ targetReps: repsMin === "" ? null : Number(repsMin) })
          }
          className="w-20"
          startContent={<span className="text-xs text-default-500">min</span>}
        />
        <Input
          aria-label="Max reps"
          size="sm"
          variant="bordered"
          type="number"
          inputMode="numeric"
          min={0}
          value={repsMax === "" ? "" : String(repsMax)}
          onChange={(e) =>
            setRepsMax(e.target.value === "" ? "" : Number(e.target.value))
          }
          onBlur={() =>
            void commit({ targetRepsMax: repsMax === "" ? null : Number(repsMax) })
          }
          className="w-20"
          startContent={<span className="text-xs text-default-500">max</span>}
        />
        <Input
          aria-label="Target weight"
          size="sm"
          variant="bordered"
          type="number"
          inputMode="decimal"
          step="0.5"
          min={0}
          value={weight === "" ? "" : String(weight)}
          onChange={(e) =>
            setWeight(e.target.value === "" ? "" : Number(e.target.value))
          }
          onBlur={() =>
            void commit({ targetWeight: weight === "" ? null : Number(weight) })
          }
          className="w-24"
          endContent={<span className="text-xs text-default-500">kg</span>}
        />
        <Button
          isIconOnly
          size="sm"
          variant="light"
          color="danger"
          aria-label="Remove set"
          onPress={remove}
          isDisabled={busy || !canDelete}
        >
          ✕
        </Button>
      </div>
      <Textarea
        aria-label="Set observation"
        size="sm"
        variant="bordered"
        minRows={1}
        maxRows={3}
        placeholder="Observation (e.g. 2s pause at bottom, RIR 1)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={() => {
          if ((notes || null) !== set.notes) {
            void commit({ notes: notes === "" ? null : notes });
          }
        }}
      />
    </div>
  );
}
