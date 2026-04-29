import { createServerClient } from "@/lib/supabase/server";
import { makeDashboardData } from "@/server/modules/fitness/factories/dashboard-factory";
import { makeExerciseData } from "@/server/modules/fitness/factories/exercise-factory";
import { makeSessionData } from "@/server/modules/fitness/factories/session-factory";
import { makePlanData } from "@/server/modules/fitness/factories/plan-factory";
import { PageHeader } from "@/components/ui/PageHeader";
import { DashboardGrid } from "@/components/modules/fitness/dashboard/DashboardGrid";
import { WorkoutsSection } from "@/components/modules/fitness/dashboard/WorkoutsSection";

export const metadata = { title: "Fitness — personal-hq" };

export default async function FitnessHomePage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const data = makeDashboardData();
  const [volume, prs, bodyWeight, exercises, sessions, activePlan] = await Promise.all([
    data.volumeByWeek(user!.id, 12),
    data.recentPrs(user!.id, 5),
    data.bodyWeightTrend(user!.id),
    makeExerciseData().list(user!.id),
    makeSessionData()
      .list(user!.id)
      .then((s) => s.slice(0, 20)),
    makePlanData().getActive(user!.id),
  ]);

  return (
    <div>
      <PageHeader title="Dashboard" description="Progress at a glance." />
      <DashboardGrid
        volume={volume}
        prs={prs}
        bodyWeight={bodyWeight}
        exercises={exercises}
      />
      <div className="mt-8">
        <WorkoutsSection
          sessions={sessions}
          activePlan={activePlan ? { name: activePlan.name, workouts: activePlan.workouts } : null}
          expandable
        />
      </div>
    </div>
  );
}
