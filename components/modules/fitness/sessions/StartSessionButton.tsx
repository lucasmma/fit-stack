"use client";

import { useState } from "react";
import {
  Button,
  Select,
  SelectItem,
  useDisclosure,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api-client";
import { StandardModal } from "@/components/ui/StandardModal";

interface PlanOption {
  id: string;
  name: string;
  isActive: boolean;
  workouts: Array<{ id: string; name: string }>;
}

interface StartSessionButtonProps {
  plans: PlanOption[];
  defaultPlanId: string | null;
}

export function StartSessionButton({ plans, defaultPlanId }: StartSessionButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const [planId, setPlanId] = useState<string | null>(defaultPlanId);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const selectedPlan = plans.find((p) => p.id === planId);

  const reset = () => {
    setPlanId(defaultPlanId);
    setWorkoutId(null);
  };

  const handleClose = () => {
    if (starting) return;
    reset();
    onClose();
  };

  const start = async () => {
    if (!planId || !workoutId) return;
    setStarting(true);
    try {
      const session = await api.sessions.create({ planId, workoutId });
      toast.success("Session started");
      router.push(`/fitness/sessions/${session.id}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not start session");
    } finally {
      setStarting(false);
    }
  };

  if (plans.length === 0) {
    return null;
  }

  return (
    <>
      <Button color="primary" onPress={onOpen}>
        Start session
      </Button>
      <StandardModal
        isOpen={isOpen}
        onClose={handleClose}
        size="md"
        scrollBehavior="inside"
        title="Start a session"
        bodyClassName="flex flex-col gap-4"
        footer={
          <>
            <Button variant="light" onPress={handleClose} isDisabled={starting}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={start}
              isLoading={starting}
              isDisabled={!planId || !workoutId}
            >
              Start
            </Button>
          </>
        }
      >
        <Select
          label="Plan"
          variant="bordered"
          selectedKeys={planId ? new Set([planId]) : new Set()}
          onSelectionChange={(keys) => {
            const next = Array.from(keys as Set<string>)[0];
            setPlanId(next ?? null);
            setWorkoutId(null);
          }}
          isRequired
        >
          {plans.map((plan) => (
            <SelectItem
              key={plan.id}
              description={plan.isActive ? "Active" : undefined}
            >
              {plan.name}
            </SelectItem>
          ))}
        </Select>
        <Select
          label="Workout"
          variant="bordered"
          selectedKeys={workoutId ? new Set([workoutId]) : new Set()}
          onSelectionChange={(keys) => {
            const next = Array.from(keys as Set<string>)[0];
            setWorkoutId(next ?? null);
          }}
          isDisabled={!selectedPlan}
          isRequired
        >
          {(selectedPlan?.workouts ?? []).map((w) => (
            <SelectItem key={w.id}>{w.name}</SelectItem>
          ))}
        </Select>
      </StandardModal>
    </>
  );
}
