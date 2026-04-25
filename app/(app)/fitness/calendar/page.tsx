import { createServerClient } from "@/lib/supabase/server";
import { makeSessionData } from "@/server/modules/fitness/factories/session-factory";
import { PageHeader } from "@/components/ui/PageHeader";
import { CalendarView } from "@/components/modules/fitness/calendar/CalendarView";
import { startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";

export const metadata = { title: "Calendar — personal-hq" };

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const current = month ? new Date(`${month}-01T00:00:00.000Z`) : new Date();

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch a ±1 month window so week overflow cells also have data.
  const from = startOfMonth(subMonths(current, 1));
  const to = endOfMonth(addMonths(current, 1));
  const sessions = await makeSessionData().list(user!.id, {
    from: from.toISOString(),
    to: to.toISOString(),
  });

  return (
    <div>
      <PageHeader title="Calendar" description="Your training history by day." />
      <CalendarView month={current} sessions={sessions} />
    </div>
  );
}
