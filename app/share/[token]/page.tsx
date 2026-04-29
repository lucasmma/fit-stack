import { notFound } from "next/navigation";
import { makeShareData } from "@/server/modules/fitness/factories/share-factory";
import { makeSessionData } from "@/server/modules/fitness/factories/session-factory";
import { makeDashboardData } from "@/server/modules/fitness/factories/dashboard-factory";
import { makePhotoData } from "@/server/modules/fitness/factories/photo-factory";
import { makePlanData } from "@/server/modules/fitness/factories/plan-factory";
import { makeWorkoutData } from "@/server/modules/fitness/factories/workout-factory";
import { SharePage } from "@/components/modules/fitness/share/SharePage";
import type { SessionDetailDTO } from "@/lib/schemas/fitness/session";
import type { WorkoutDetailDTO } from "@/lib/schemas/fitness/workout";

export const metadata = {
  title: "Shared — personal-hq",
  robots: { index: false, follow: false },
};

export default async function PublicSharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const link = await makeShareData().resolveToken(token);
  if (!link) notFound();

  const includeProgress = link.scope === "PROGRESS_ONLY" || link.scope === "ALL";
  const includeWorkouts = link.scope === "WORKOUTS_ONLY" || link.scope === "ALL";

  const [volume, prs, bodyWeight, photos, exerciseProgressions, sessions, activePlan] =
    await Promise.all([
      includeProgress ? makeDashboardData().volumeByWeek(link.userId, 12) : null,
      includeProgress ? makeDashboardData().recentPrs(link.userId, 5) : null,
      includeProgress ? makeDashboardData().bodyWeightTrend(link.userId) : null,
      includeProgress ? makePhotoData().list(link.userId) : null,
      includeProgress ? makeDashboardData().progressionForUser(link.userId) : null,
      includeWorkouts
        ? makeSessionData()
            .list(link.userId)
            .then((s) => s.slice(0, 20))
        : null,
      includeWorkouts ? makePlanData().getActive(link.userId) : null,
    ]);

  let sessionDetails: Record<string, SessionDetailDTO> = {};
  let workoutDetails: Record<string, WorkoutDetailDTO> = {};
  if (includeWorkouts) {
    const sessionData = makeSessionData();
    const workoutData = makeWorkoutData();
    const [sessionDetailList, workoutDetailList] = await Promise.all([
      Promise.all((sessions ?? []).map((s) => sessionData.getDetail(s.id, link.userId))),
      Promise.all(
        (activePlan?.workouts ?? []).map((w) => workoutData.getDetail(w.id, link.userId)),
      ),
    ]);
    sessionDetails = Object.fromEntries(sessionDetailList.map((d) => [d.id, d]));
    workoutDetails = Object.fromEntries(workoutDetailList.map((d) => [d.id, d]));
  }

  return (
    <SharePage
      name={link.name}
      scope={link.scope}
      progress={
        includeProgress
          ? {
              volume: volume ?? [],
              prs: prs ?? [],
              bodyWeight: bodyWeight ?? [],
              photos: photos ?? [],
              exerciseProgressions: exerciseProgressions ?? [],
            }
          : null
      }
      workouts={
        includeWorkouts
          ? {
              sessions: sessions ?? [],
              activePlan: activePlan ? { name: activePlan.name, workouts: activePlan.workouts } : null,
              sessionDetails,
              workoutDetails,
            }
          : null
      }
    />
  );
}
