import "server-only";
import type { PrismaClient } from "@prisma/client";
import { errors } from "@/server/presentation/helpers/http";
import type {
  WorkoutDetailDTO,
  CreateWorkoutInput,
  UpdateWorkoutInput,
  AddPlanExerciseInput,
  UpdatePlanExerciseInput,
  CreatePlanSetInput,
  UpdatePlanSetInput,
  PlanSetDTO,
  PlanExerciseDTO,
} from "@/lib/schemas/workout";
import { mapWorkoutDetail, mapPlanExercise, mapPlanSet } from "./mappers";

export class WorkoutData {
  constructor(private readonly prisma: PrismaClient) {}

  async getDetail(workoutId: string, userId: string): Promise<WorkoutDetailDTO> {
    const workout = await this.prisma.workout.findFirst({
      where: { id: workoutId, plan: { userId } },
      include: {
        exercises: {
          orderBy: { order: "asc" },
          include: {
            exercise: true,
            sets: { orderBy: { order: "asc" } },
          },
        },
      },
    });
    if (!workout) throw errors.notFound("Workout not found");
    return mapWorkoutDetail(workout);
  }

  async create(
    planId: string,
    userId: string,
    input: CreateWorkoutInput,
  ): Promise<WorkoutDetailDTO> {
    await this.assertPlanOwned(planId, userId);
    const nextOrder =
      input.order ??
      (await this.prisma.workout.count({ where: { planId } }));
    const workout = await this.prisma.workout.create({
      data: {
        planId,
        name: input.name,
        description: input.description ?? null,
        order: nextOrder,
      },
      include: {
        exercises: {
          include: { exercise: true, sets: true },
        },
      },
    });
    return mapWorkoutDetail(workout);
  }

  async update(
    workoutId: string,
    userId: string,
    input: UpdateWorkoutInput,
  ): Promise<WorkoutDetailDTO> {
    await this.assertOwned(workoutId, userId);
    await this.prisma.workout.update({
      where: { id: workoutId },
      data: {
        name: input.name ?? undefined,
        description: input.description ?? undefined,
        order: input.order ?? undefined,
      },
    });
    return this.getDetail(workoutId, userId);
  }

  async delete(workoutId: string, userId: string): Promise<void> {
    await this.assertOwned(workoutId, userId);
    await this.prisma.workout.delete({ where: { id: workoutId } });
  }

  async addExercise(
    workoutId: string,
    userId: string,
    input: AddPlanExerciseInput,
  ): Promise<PlanExerciseDTO> {
    await this.assertOwned(workoutId, userId);
    const nextOrder = await this.prisma.planExercise.count({ where: { workoutId } });
    const created = await this.prisma.planExercise.create({
      data: {
        workoutId,
        exerciseId: input.exerciseId,
        order: nextOrder,
        notes: input.notes ?? null,
        sets: {
          create: input.sets.map((s, i) => ({
            order: i,
            type: s.type,
            label: s.label ?? null,
            targetReps: s.targetReps ?? null,
            targetRepsMax: s.targetRepsMax ?? null,
            targetWeight: s.targetWeight ?? null,
            notes: s.notes ?? null,
          })),
        },
      },
      include: {
        exercise: true,
        sets: { orderBy: { order: "asc" } },
      },
    });
    return mapPlanExercise(created);
  }

  async updateExercise(
    planExerciseId: string,
    userId: string,
    input: UpdatePlanExerciseInput,
  ): Promise<PlanExerciseDTO> {
    await this.assertExerciseOwned(planExerciseId, userId);
    const updated = await this.prisma.planExercise.update({
      where: { id: planExerciseId },
      data: {
        order: input.order ?? undefined,
        notes: input.notes ?? undefined,
      },
      include: { exercise: true, sets: { orderBy: { order: "asc" } } },
    });
    return mapPlanExercise(updated);
  }

  async removeExercise(planExerciseId: string, userId: string): Promise<void> {
    await this.assertExerciseOwned(planExerciseId, userId);
    await this.prisma.planExercise.delete({ where: { id: planExerciseId } });
  }

  async addSet(
    planExerciseId: string,
    userId: string,
    input: CreatePlanSetInput,
  ): Promise<PlanSetDTO> {
    await this.assertExerciseOwned(planExerciseId, userId);
    const nextOrder = await this.prisma.planSet.count({ where: { planExerciseId } });
    const created = await this.prisma.planSet.create({
      data: {
        planExerciseId,
        order: nextOrder,
        type: input.type,
        label: input.label ?? null,
        targetReps: input.targetReps ?? null,
        targetRepsMax: input.targetRepsMax ?? null,
        targetWeight: input.targetWeight ?? null,
        notes: input.notes ?? null,
      },
    });
    return mapPlanSet(created);
  }

  async updateSet(
    planSetId: string,
    userId: string,
    input: UpdatePlanSetInput,
  ): Promise<PlanSetDTO> {
    await this.assertSetOwned(planSetId, userId);
    const updated = await this.prisma.planSet.update({
      where: { id: planSetId },
      data: {
        type: input.type ?? undefined,
        label: input.label ?? undefined,
        targetReps: input.targetReps === undefined ? undefined : input.targetReps,
        targetRepsMax:
          input.targetRepsMax === undefined ? undefined : input.targetRepsMax,
        targetWeight: input.targetWeight ?? undefined,
        notes: input.notes ?? undefined,
        order: input.order ?? undefined,
      },
    });
    return mapPlanSet(updated);
  }

  async removeSet(planSetId: string, userId: string): Promise<void> {
    await this.assertSetOwned(planSetId, userId);
    await this.prisma.planSet.delete({ where: { id: planSetId } });
  }

  private async assertPlanOwned(planId: string, userId: string) {
    const exists = await this.prisma.plan.findFirst({
      where: { id: planId, userId },
      select: { id: true },
    });
    if (!exists) throw errors.notFound("Plan not found");
  }

  private async assertOwned(workoutId: string, userId: string) {
    const exists = await this.prisma.workout.findFirst({
      where: { id: workoutId, plan: { userId } },
      select: { id: true },
    });
    if (!exists) throw errors.notFound("Workout not found");
  }

  private async assertExerciseOwned(planExerciseId: string, userId: string) {
    const exists = await this.prisma.planExercise.findFirst({
      where: { id: planExerciseId, workout: { plan: { userId } } },
      select: { id: true },
    });
    if (!exists) throw errors.notFound("Exercise not found");
  }

  private async assertSetOwned(planSetId: string, userId: string) {
    const exists = await this.prisma.planSet.findFirst({
      where: { id: planSetId, planExercise: { workout: { plan: { userId } } } },
      select: { id: true },
    });
    if (!exists) throw errors.notFound("Set not found");
  }
}
