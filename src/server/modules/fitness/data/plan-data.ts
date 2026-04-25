import "server-only";
import type { PrismaClient } from "@prisma/client";
import type { PlanDTO, PlanDetailDTO, CreatePlanInput, UpdatePlanInput } from "@/lib/schemas/fitness/plan";
import { errors } from "@/server/shared/presentation/helpers/http";
import { mapWorkoutDetail } from "./mappers";

export class PlanData {
  constructor(private readonly prisma: PrismaClient) {}

  async list(userId: string): Promise<PlanDTO[]> {
    const plans = await this.prisma.plan.findMany({
      where: { userId, archivedAt: null },
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
      include: { _count: { select: { workouts: true } } },
    });
    return plans.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      isActive: p.isActive,
      archivedAt: p.archivedAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
      workoutCount: p._count.workouts,
    }));
  }

  async getDetail(planId: string, userId: string): Promise<PlanDetailDTO> {
    const plan = await this.prisma.plan.findFirst({
      where: { id: planId, userId },
      include: {
        _count: { select: { workouts: true } },
        workouts: {
          orderBy: { order: "asc" },
          include: {
            exercises: {
              orderBy: { order: "asc" },
              include: {
                exercise: true,
                sets: { orderBy: { order: "asc" } },
              },
            },
          },
        },
      },
    });
    if (!plan) throw errors.notFound("Plan not found");
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      isActive: plan.isActive,
      archivedAt: plan.archivedAt?.toISOString() ?? null,
      createdAt: plan.createdAt.toISOString(),
      workoutCount: plan._count.workouts,
      workouts: plan.workouts.map(mapWorkoutDetail),
    };
  }

  async getActive(userId: string) {
    return this.prisma.plan.findFirst({
      where: { userId, isActive: true, archivedAt: null },
      include: {
        workouts: {
          orderBy: { order: "asc" },
          select: { id: true, name: true, order: true },
        },
      },
    });
  }

  async create(userId: string, input: CreatePlanInput): Promise<PlanDTO> {
    const hasActive = await this.prisma.plan.findFirst({
      where: { userId, isActive: true, archivedAt: null },
      select: { id: true },
    });
    const plan = await this.prisma.plan.create({
      data: {
        userId,
        name: input.name,
        description: input.description ?? null,
        isActive: !hasActive, // first plan becomes active automatically
      },
      include: { _count: { select: { workouts: true } } },
    });
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      isActive: plan.isActive,
      archivedAt: plan.archivedAt?.toISOString() ?? null,
      createdAt: plan.createdAt.toISOString(),
      workoutCount: plan._count.workouts,
    };
  }

  async update(planId: string, userId: string, input: UpdatePlanInput): Promise<PlanDTO> {
    await this.assertOwns(planId, userId);
    const plan = await this.prisma.plan.update({
      where: { id: planId },
      data: {
        name: input.name ?? undefined,
        description: input.description ?? undefined,
        archivedAt: input.archivedAt === undefined ? undefined : input.archivedAt === null ? null : new Date(input.archivedAt),
      },
      include: { _count: { select: { workouts: true } } },
    });
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      isActive: plan.isActive,
      archivedAt: plan.archivedAt?.toISOString() ?? null,
      createdAt: plan.createdAt.toISOString(),
      workoutCount: plan._count.workouts,
    };
  }

  async delete(planId: string, userId: string): Promise<void> {
    // Soft delete by archiving: preserves historical sessions referencing the plan.
    await this.assertOwns(planId, userId);
    await this.prisma.plan.update({
      where: { id: planId },
      data: { archivedAt: new Date(), isActive: false },
    });
  }

  async activate(planId: string, userId: string): Promise<PlanDTO> {
    await this.assertOwns(planId, userId);
    const plan = await this.prisma.$transaction(async (tx) => {
      await tx.plan.updateMany({
        where: { userId, isActive: true, NOT: { id: planId } },
        data: { isActive: false },
      });
      return tx.plan.update({
        where: { id: planId },
        data: { isActive: true, archivedAt: null },
        include: { _count: { select: { workouts: true } } },
      });
    });
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      isActive: plan.isActive,
      archivedAt: plan.archivedAt?.toISOString() ?? null,
      createdAt: plan.createdAt.toISOString(),
      workoutCount: plan._count.workouts,
    };
  }

  async assertOwns(planId: string, userId: string): Promise<void> {
    const plan = await this.prisma.plan.findFirst({
      where: { id: planId, userId },
      select: { id: true },
    });
    if (!plan) throw errors.notFound("Plan not found");
  }
}
