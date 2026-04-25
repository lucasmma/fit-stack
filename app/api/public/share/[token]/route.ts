import { NextResponse, type NextRequest } from "next/server";
import { makeShareData } from "@/server/factories/share-factory";
import { makeSessionData } from "@/server/factories/session-factory";
import { makeDashboardData } from "@/server/factories/dashboard-factory";
import { makePhotoData } from "@/server/factories/photo-factory";
import { makePlanData } from "@/server/factories/plan-factory";

export const runtime = "nodejs";

type Params = { token: string };

// TODO: add per-IP/per-token rate-limiting via Upstash or similar.
// For v1, Vercel's default request limits and the opaque token provide basic protection.

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const { token } = await params;
  const shareData = makeShareData();
  const link = await shareData.resolveToken(token);
  if (!link) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Link not found or revoked." },
      { status: 404 },
    );
  }

  const userId = link.userId;
  const scope = link.scope;

  const includeProgress = scope === "PROGRESS_ONLY" || scope === "ALL";
  const includeWorkouts = scope === "WORKOUTS_ONLY" || scope === "ALL";

  const [volume, prs, bodyWeight, photos, sessions, plans] = await Promise.all([
    includeProgress ? makeDashboardData().volumeByWeek(userId, 12) : Promise.resolve(null),
    includeProgress ? makeDashboardData().recentPrs(userId, 5) : Promise.resolve(null),
    includeProgress ? makeDashboardData().bodyWeightTrend(userId) : Promise.resolve(null),
    includeProgress ? makePhotoData().list(userId) : Promise.resolve(null),
    includeWorkouts
      ? makeSessionData().list(userId).then((s) => s.slice(0, 20))
      : Promise.resolve(null),
    includeWorkouts ? makePlanData().getActive(userId) : Promise.resolve(null),
  ]);

  return NextResponse.json(
    {
      scope,
      name: link.name,
      progress: includeProgress
        ? { volume, prs, bodyWeight, photos }
        : null,
      workouts: includeWorkouts
        ? { sessions, activePlan: plans ? { name: plans.name, workouts: plans.workouts } : null }
        : null,
    },
    { headers: { "X-Robots-Tag": "noindex, nofollow" } },
  );
}
