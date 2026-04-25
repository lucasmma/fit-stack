import { startOfISOWeek, formatISO } from "date-fns";

export function isoWeekStart(date: Date): string {
  return formatISO(startOfISOWeek(date), { representation: "date" });
}
