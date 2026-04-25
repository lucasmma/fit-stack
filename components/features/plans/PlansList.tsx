"use client";

import type { PlanDTO } from "@/lib/schemas/plan";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlanCard } from "./PlanCard";
import { CreatePlanButton } from "./CreatePlanButton";

interface PlansListProps {
  plans: PlanDTO[];
}

export function PlansList({ plans }: PlansListProps) {
  if (plans.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="No plans yet"
        description="Create your first plan to start building workouts."
        action={<CreatePlanButton />}
      />
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}
