import "server-only";
import type { PrismaClient } from "@prisma/client";
import { errors } from "@/server/shared/presentation/helpers/http";
import type {
  CreateSessionInput,
  SessionDetailDTO,
  SessionSummaryDTO,
  SessionDTO,
  UpdateSessionSetInput,
  AddSessionSetInput,
  AddSessionExerciseInput,
  SessionSetDTO,
  SessionExerciseDTO,
} from "@/lib/schemas/fitness/session";
import { mapSession, mapSessionBase, mapSessionSet, mapSessionExercise } from "./mappers";
import { toNumber } from "@/lib/utils/decimal";

export class SessionData {
  constructor(private readonly prisma: PrismaClient) {}

  async list(
    userId: string,
    query: { from?: string; to?: string } = {},
  ): Promise<SessionSummaryDTO[]> {
    const where = {
      userId,
      ...(query.from ? { startedAt: { gte: new Date(query.from) } } : {}),
      ...(query.to
        ? {
            startedAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              lte: new Date(query.to),
            },
          }
        : {}),
    };
    const rows = await this.prisma.session.findMany({
      where,
      orderBy: { startedAt: "desc" },
      include: {
        plan: { select: { name: true } },
        workout: { select: { name: true } },
        exercises: {
          select: {
            id: true,
            sets: { select: { id: true, completed: true, reps: true, weight: true, type: true } },
          },
        },
      },
    });
    return rows.map((s) => {
      const base = mapSessionBase(s);
      const flatSets = s.exercises.flatMap((e) => e.sets);
      const completedSetCount = flatSets.filter((x) => x.completed).length;
      const totalVolume = flatSets.reduce((sum, x) => {
        if (!x.completed || x.type !== "WORKING") return sum;
        const reps = x.reps ?? 0;
        const weight = toNumber(x.weight) ?? 0;
        return sum + reps * weight;
      }, 0);
      return {
        ...base,
        exerciseCount: s.exercises.length,
        completedSetCount,
        totalSetCount: flatSets.length,
        totalVolume,
      };
    });
  }

  async getDetail(sessionId: string, userId: string): Promise<SessionDetailDTO> {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
      include: {
        plan: { select: { name: true } },
        workout: { select: { name: true } },
        exercises: {
          orderBy: { order: "asc" },
          include: {
            exercise: true,
            sets: { orderBy: { order: "asc" } },
          },
        },
      },
    });
    if (!session) throw errors.notFound("Session not found");
    return mapSession(session);
  }

  async create(userId: string, input: CreateSessionInput): Promise<SessionDetailDTO> {
    const workout = await this.prisma.workout.findFirst({
      where: { id: input.workoutId, planId: input.planId, plan: { userId } },
      include: {
        exercises: {
          orderBy: { order: "asc" },
          include: {
            sets: { orderBy: { order: "asc" } },
          },
        },
      },
    });
    if (!workout) throw errors.notFound("Workout not found in this plan.");

    const session = await this.prisma.$transaction(async (tx) => {
      const s = await tx.session.create({
        data: {
          userId,
          planId: input.planId,
          workoutId: input.workoutId,
          notes: input.notes ?? null,
        },
      });

      for (const pe of workout.exercises) {
        const se = await tx.sessionExercise.create({
          data: {
            sessionId: s.id,
            exerciseId: pe.exerciseId,
            planExerciseId: pe.id,
            order: pe.order,
            notes: pe.notes,
          },
        });
        if (pe.sets.length > 0) {
          await tx.sessionSet.createMany({
            data: pe.sets.map((ps, i) => ({
              sessionExerciseId: se.id,
              order: i,
              type: ps.type,
              label: ps.label,
              reps: null,
              weight: null,
            })),
          });
        }
      }
      return s.id;
    });

    return this.getDetail(session, userId);
  }

  async finish(sessionId: string, userId: string): Promise<SessionDTO> {
    await this.assertOwned(sessionId, userId);
    const updated = await this.prisma.session.update({
      where: { id: sessionId },
      data: { finishedAt: new Date() },
      include: { plan: { select: { name: true } }, workout: { select: { name: true } } },
    });
    return mapSessionBase(updated);
  }

  async updateSet(
    setId: string,
    userId: string,
    input: UpdateSessionSetInput,
  ): Promise<SessionSetDTO> {
    const row = await this.prisma.sessionSet.findFirst({
      where: { id: setId, sessionExercise: { session: { userId } } },
      select: { id: true, completed: true },
    });
    if (!row) throw errors.notFound("Set not found");

    const completedChanged =
      input.completed !== undefined && input.completed !== row.completed;

    const updated = await this.prisma.sessionSet.update({
      where: { id: setId },
      data: {
        reps: input.reps ?? undefined,
        weight: input.weight ?? undefined,
        rpe: input.rpe ?? undefined,
        completed: input.completed ?? undefined,
        completedAt: completedChanged ? (input.completed ? new Date() : null) : undefined,
        notes: input.notes ?? undefined,
      },
    });
    return mapSessionSet(updated);
  }

  async removeSet(setId: string, userId: string): Promise<void> {
    const row = await this.prisma.sessionSet.findFirst({
      where: { id: setId, sessionExercise: { session: { userId } } },
      select: { id: true },
    });
    if (!row) throw errors.notFound("Set not found");
    await this.prisma.sessionSet.delete({ where: { id: setId } });
  }

  async addSet(
    sessionExerciseId: string,
    userId: string,
    input: AddSessionSetInput,
  ): Promise<SessionSetDTO> {
    const se = await this.prisma.sessionExercise.findFirst({
      where: { id: sessionExerciseId, session: { userId } },
      select: { id: true },
    });
    if (!se) throw errors.notFound("Exercise not found in session");
    const nextOrder = await this.prisma.sessionSet.count({ where: { sessionExerciseId } });
    const created = await this.prisma.sessionSet.create({
      data: {
        sessionExerciseId,
        order: nextOrder,
        type: input.type,
        label: input.label ?? null,
        reps: input.reps ?? null,
        weight: input.weight ?? null,
        rpe: input.rpe ?? null,
      },
    });
    return mapSessionSet(created);
  }

  async addExercise(
    sessionId: string,
    userId: string,
    input: AddSessionExerciseInput,
  ): Promise<SessionExerciseDTO> {
    await this.assertOwned(sessionId, userId);
    const nextOrder = await this.prisma.sessionExercise.count({ where: { sessionId } });
    const created = await this.prisma.sessionExercise.create({
      data: {
        sessionId,
        exerciseId: input.exerciseId,
        order: nextOrder,
        notes: input.notes ?? null,
        sets: {
          create: [{ order: 0, type: "WORKING" }],
        },
      },
      include: {
        exercise: true,
        sets: { orderBy: { order: "asc" } },
      },
    });
    return mapSessionExercise(created);
  }

  private async assertOwned(sessionId: string, userId: string) {
    const exists = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
      select: { id: true },
    });
    if (!exists) throw errors.notFound("Session not found");
  }
}
