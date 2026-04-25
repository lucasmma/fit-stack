"use client";

import Link from "next/link";
import { Card, CardBody, CardFooter, Chip, Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import type { PlanDTO } from "@/lib/schemas/fitness/plan";
import { api } from "@/lib/api-client";

export function PlanCard({ plan }: { plan: PlanDTO }) {
  const router = useRouter();
  const [activating, setActivating] = useState(false);

  const activate = async () => {
    setActivating(true);
    try {
      await api.plans.activate(plan.id);
      toast.success(`${plan.name} is now active`);
      router.refresh();
    } catch {
      toast.error("Could not activate plan");
    } finally {
      setActivating(false);
    }
  };

  return (
    <Card isPressable as={Link} href={`/fitness/plans/${plan.id}`} shadow="sm" className="h-full">
      <CardBody className="gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
          {plan.isActive && (
            <Chip size="sm" color="primary" variant="flat">
              Active
            </Chip>
          )}
        </div>
        {plan.description && (
          <p className="line-clamp-2 text-sm text-default-500">{plan.description}</p>
        )}
        <p className="text-xs text-default-400">
          {plan.workoutCount} workout{plan.workoutCount === 1 ? "" : "s"}
        </p>
      </CardBody>
      {!plan.isActive && (
        <CardFooter className="pt-0">
          <Button
            size="sm"
            variant="flat"
            onPress={activate}
            isLoading={activating}
            onClick={(e) => e.stopPropagation()}
          >
            Set active
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
