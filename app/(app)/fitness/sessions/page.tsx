import { createServerClient } from "@/lib/supabase/server";
import { makeSessionData } from "@/server/modules/fitness/factories/session-factory";
import { makePlanData } from "@/server/modules/fitness/factories/plan-factory";
import { prisma } from "@/server/shared/config/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { SessionsList } from "@/components/modules/fitness/sessions/SessionsList";
import { StartSessionButton } from "@/components/modules/fitness/sessions/StartSessionButton";

export const metadata = { title: "Sessions — personal-hq" };

export default async function SessionsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [sessions, plans] = await Promise.all([
    makeSessionData().list(user!.id),
    prisma.plan.findMany({
      where: { userId: user!.id, archivedAt: null },
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
      include: {
        workouts: {
          orderBy: { order: "asc" },
          select: { id: true, name: true },
        },
      },
    }),
  ]);

  const activePlan = plans.find((p) => p.isActive) ?? null;

  // Reuse the plan data shape for the picker
  const planOptions = plans.map((p) => ({
    id: p.id,
    name: p.name,
    isActive: p.isActive,
    workouts: p.workouts,
  }));

  void makePlanData; // silence unused import if any

  return (
    <div>
      <PageHeader
        title="Sessions"
        description="Your training history."
        actions={<StartSessionButton plans={planOptions} defaultPlanId={activePlan?.id ?? null} />}
      />
      <SessionsList sessions={sessions} />
    </div>
  );
}
