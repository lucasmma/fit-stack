import "server-only";
import type { PrismaClient, SetType } from "@prisma/client";
import { startOfISOWeek, subWeeks, formatISO } from "date-fns";
import { toNumber } from "@/lib/utils/decimal";

type VolumePoint = { weekStart: string; volume: number; sessions: number };
type ProgressionPoint = { date: string; topWeight: number; estimatedOneRm: number };
type PrRow = { exerciseId: string; exerciseName: string; weight: number; date: string };
type ProgressionForExercise = {
  exerciseId: string;
  exerciseName: string;
  points: ProgressionPoint[];
};

export class DashboardData {
  constructor(private readonly prisma: PrismaClient) {}

  async volumeByWeek(userId: string, weeks: number): Promise<VolumePoint[]> {
    const from = startOfISOWeek(subWeeks(new Date(), weeks - 1));
    const rows = await this.prisma.session.findMany({
      where: { userId, finishedAt: { not: null }, startedAt: { gte: from } },
      select: {
        id: true,
        startedAt: true,
        exercises: {
          select: {
            sets: {
              select: { reps: true, weight: true, completed: true, type: true },
            },
          },
        },
      },
    });

    const buckets = new Map<string, { volume: number; sessions: Set<string> }>();
    for (let i = 0; i < weeks; i++) {
      const key = formatISO(startOfISOWeek(subWeeks(new Date(), weeks - 1 - i)), {
        representation: "date",
      });
      buckets.set(key, { volume: 0, sessions: new Set() });
    }

    for (const session of rows) {
      const key = formatISO(startOfISOWeek(session.startedAt), { representation: "date" });
      const bucket = buckets.get(key);
      if (!bucket) continue;
      bucket.sessions.add(session.id);
      for (const ex of session.exercises) {
        for (const set of ex.sets) {
          if (!set.completed || set.type !== "WORKING") continue;
          bucket.volume += (set.reps ?? 0) * (toNumber(set.weight) ?? 0);
        }
      }
    }

    return Array.from(buckets.entries()).map(([weekStart, v]) => ({
      weekStart,
      volume: Math.round(v.volume),
      sessions: v.sessions.size,
    }));
  }

  async exerciseProgression(userId: string, exerciseId: string): Promise<ProgressionPoint[]> {
    const sets = await this.prisma.sessionSet.findMany({
      where: {
        completed: true,
        type: "WORKING" satisfies SetType,
        reps: { not: null },
        weight: { not: null },
        sessionExercise: {
          exerciseId,
          session: { userId, finishedAt: { not: null } },
        },
      },
      include: {
        sessionExercise: {
          select: { session: { select: { startedAt: true } } },
        },
      },
      orderBy: { sessionExercise: { session: { startedAt: "asc" } } },
    });

    const byDate = new Map<string, { top: number; oneRm: number }>();
    for (const set of sets) {
      const date = set.sessionExercise.session.startedAt.toISOString().slice(0, 10);
      const reps = set.reps!;
      const weight = toNumber(set.weight) ?? 0;
      const oneRm = weight * (1 + reps / 30); // Epley
      const current = byDate.get(date) ?? { top: 0, oneRm: 0 };
      byDate.set(date, {
        top: Math.max(current.top, weight),
        oneRm: Math.max(current.oneRm, oneRm),
      });
    }

    return Array.from(byDate.entries()).map(([date, v]) => ({
      date,
      topWeight: Math.round(v.top * 100) / 100,
      estimatedOneRm: Math.round(v.oneRm * 100) / 100,
    }));
  }

  async progressionForUser(userId: string): Promise<ProgressionForExercise[]> {
    const exercises = await this.prisma.sessionExercise.findMany({
      where: {
        session: { userId, finishedAt: { not: null } },
        sets: {
          some: {
            completed: true,
            type: "WORKING" satisfies SetType,
            reps: { not: null },
            weight: { not: null },
          },
        },
      },
      select: { exerciseId: true, exercise: { select: { name: true } } },
      distinct: ["exerciseId"],
    });

    const results = await Promise.all(
      exercises.map(async (e) => ({
        exerciseId: e.exerciseId,
        exerciseName: e.exercise.name,
        points: await this.exerciseProgression(userId, e.exerciseId),
      })),
    );

    return results
      .filter((r) => r.points.length > 0)
      .sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));
  }

  async recentPrs(userId: string, limit: number): Promise<PrRow[]> {
    const sets = await this.prisma.sessionSet.findMany({
      where: {
        completed: true,
        type: "WORKING" satisfies SetType,
        weight: { not: null },
        sessionExercise: { session: { userId, finishedAt: { not: null } } },
      },
      include: {
        sessionExercise: {
          select: {
            exerciseId: true,
            exercise: { select: { name: true } },
            session: { select: { startedAt: true } },
          },
        },
      },
      orderBy: { sessionExercise: { session: { startedAt: "desc" } } },
    });

    const bestPerExercise = new Map<string, PrRow>();
    for (const set of sets) {
      const id = set.sessionExercise.exerciseId;
      const weight = toNumber(set.weight) ?? 0;
      const existing = bestPerExercise.get(id);
      if (!existing || existing.weight < weight) {
        bestPerExercise.set(id, {
          exerciseId: id,
          exerciseName: set.sessionExercise.exercise.name,
          weight,
          date: set.sessionExercise.session.startedAt.toISOString(),
        });
      }
    }

    return Array.from(bestPerExercise.values())
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, limit);
  }

  async bodyWeightTrend(userId: string): Promise<Array<{ date: string; bodyWeightKg: number }>> {
    const photos = await this.prisma.progressPhoto.findMany({
      where: { userId, bodyWeightKg: { not: null } },
      orderBy: { takenAt: "asc" },
      select: { takenAt: true, bodyWeightKg: true },
    });
    return photos.map((p) => ({
      date: p.takenAt.toISOString().slice(0, 10),
      bodyWeightKg: toNumber(p.bodyWeightKg) ?? 0,
    }));
  }
}
