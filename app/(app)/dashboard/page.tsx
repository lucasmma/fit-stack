import { createServerClient } from "@/lib/supabase/server";
import { makeDashboardData } from "@/server/factories/dashboard-factory";
import { makeExerciseData } from "@/server/factories/exercise-factory";
import { PageHeader } from "@/components/ui/PageHeader";
import { DashboardGrid } from "@/components/features/dashboard/DashboardGrid";

export const metadata = { title: "Dashboard — fit-stack" };

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const data = makeDashboardData();
  const [volume, prs, bodyWeight, exercises] = await Promise.all([
    data.volumeByWeek(user!.id, 12),
    data.recentPrs(user!.id, 5),
    data.bodyWeightTrend(user!.id),
    makeExerciseData().list(user!.id),
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
    </div>
  );
}
