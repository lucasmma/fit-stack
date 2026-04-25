import { notFound } from "next/navigation";
import { makeShareData } from "@/server/factories/share-factory";
import { makeSessionData } from "@/server/factories/session-factory";
import { makeDashboardData } from "@/server/factories/dashboard-factory";
import { makePhotoData } from "@/server/factories/photo-factory";
import { makePlanData } from "@/server/factories/plan-factory";
import { SharePage } from "@/components/features/share/SharePage";

export const metadata = {
  title: "Shared — fit-stack",
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
            }
          : null
      }
    />
  );
}
