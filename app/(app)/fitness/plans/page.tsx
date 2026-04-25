import { createServerClient } from "@/lib/supabase/server";
import { makePlanData } from "@/server/modules/fitness/factories/plan-factory";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlansList } from "@/components/modules/fitness/plans/PlansList";
import { CreatePlanButton } from "@/components/modules/fitness/plans/CreatePlanButton";

export const metadata = { title: "Plans — personal-hq" };

export default async function PlansPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const planData = makePlanData();
  const plans = await planData.list(user!.id);

  return (
    <div>
      <PageHeader
        title="Plans"
        description="Group your workouts into routines (PPL, Upper/Lower, …)."
        actions={<CreatePlanButton />}
      />
      <PlansList plans={plans} />
    </div>
  );
}
