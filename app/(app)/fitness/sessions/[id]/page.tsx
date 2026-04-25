import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { makeSessionData } from "@/server/modules/fitness/factories/session-factory";
import { makeExerciseData } from "@/server/modules/fitness/factories/exercise-factory";
import { SessionScreen } from "@/components/modules/fitness/sessions/SessionScreen";
import { AppError } from "@/server/shared/presentation/helpers/http";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const [session, catalog] = await Promise.all([
      makeSessionData().getDetail(id, user!.id),
      makeExerciseData().list(user!.id),
    ]);
    return <SessionScreen initialSession={session} catalog={catalog} />;
  } catch (err) {
    if (err instanceof AppError && err.statusCode === 404) notFound();
    throw err;
  }
}
