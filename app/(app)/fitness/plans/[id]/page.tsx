import { notFound } from "next/navigation";
import { Chip } from "@heroui/react";
import { createServerClient } from "@/lib/supabase/server";
import { makePlanData } from "@/server/modules/fitness/factories/plan-factory";
import { makeExerciseData } from "@/server/modules/fitness/factories/exercise-factory";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlanActions } from "@/components/modules/fitness/plans/PlanActions";
import { WorkoutsEditor } from "@/components/modules/fitness/plans/WorkoutsEditor";
import { AppError } from "@/server/shared/presentation/helpers/http";

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let plan;
  try {
    plan = await makePlanData().getDetail(id, user!.id);
  } catch (err) {
    if (err instanceof AppError && err.statusCode === 404) notFound();
    throw err;
  }

  const exercises = await makeExerciseData().list(user!.id);

  return (
    <div>
      <PageHeader
        title={plan.name}
        description={plan.description ?? undefined}
        actions={
          <div className="flex items-center gap-2">
            {plan.isActive && (
              <Chip color="primary" variant="flat" size="sm">
                Active
              </Chip>
            )}
            <PlanActions plan={plan} />
          </div>
        }
      />
      <WorkoutsEditor plan={plan} catalog={exercises} />
    </div>
  );
}
