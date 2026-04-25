import "server-only";
import type {
  Workout,
  PlanExercise,
  PlanSet,
  Exercise,
  Session,
  SessionExercise,
  SessionSet,
  ProgressPhoto,
  ShareLink,
} from "@prisma/client";
import type { WorkoutDetailDTO, PlanExerciseDTO, PlanSetDTO } from "@/lib/schemas/workout";
import type { ExerciseDTO } from "@/lib/schemas/exercise";
import type {
  SessionDetailDTO,
  SessionExerciseDTO,
  SessionSetDTO,
  SessionDTO,
} from "@/lib/schemas/session";
import type { ShareLinkDTO } from "@/lib/schemas/share";
import { toNumber } from "@/lib/utils/decimal";

type WorkoutWithRelations = Workout & {
  exercises: Array<
    PlanExercise & {
      exercise: Exercise;
      sets: PlanSet[];
    }
  >;
};

type SessionWithRelations = Session & {
  exercises: Array<
    SessionExercise & {
      exercise: Exercise;
      sets: SessionSet[];
    }
  >;
  plan: { name: string };
  workout: { name: string };
};

export function mapExercise(e: Exercise): ExerciseDTO {
  return {
    id: e.id,
    name: e.name,
    muscleGroup: e.muscleGroup,
    equipment: e.equipment,
    description: e.description,
    ownerId: e.ownerId,
  };
}

export function mapPlanSet(s: PlanSet): PlanSetDTO {
  return {
    id: s.id,
    planExerciseId: s.planExerciseId,
    order: s.order,
    type: s.type,
    label: s.label,
    targetReps: s.targetReps,
    targetRepsMax: s.targetRepsMax,
    targetWeight: toNumber(s.targetWeight),
    notes: s.notes,
  };
}

export function mapPlanExercise(
  pe: PlanExercise & { exercise: Exercise; sets: PlanSet[] },
): PlanExerciseDTO {
  return {
    id: pe.id,
    workoutId: pe.workoutId,
    exerciseId: pe.exerciseId,
    order: pe.order,
    notes: pe.notes,
    exercise: mapExercise(pe.exercise),
    sets: pe.sets.map(mapPlanSet),
  };
}

export function mapWorkoutDetail(w: WorkoutWithRelations): WorkoutDetailDTO {
  return {
    id: w.id,
    planId: w.planId,
    name: w.name,
    description: w.description,
    order: w.order,
    exercises: w.exercises.map(mapPlanExercise),
  };
}

export function mapSessionSet(s: SessionSet): SessionSetDTO {
  return {
    id: s.id,
    sessionExerciseId: s.sessionExerciseId,
    order: s.order,
    type: s.type,
    label: s.label,
    reps: s.reps,
    weight: toNumber(s.weight),
    rpe: toNumber(s.rpe),
    completed: s.completed,
    completedAt: s.completedAt?.toISOString() ?? null,
    notes: s.notes,
  };
}

export function mapSessionExercise(
  se: SessionExercise & { exercise: Exercise; sets: SessionSet[] },
): SessionExerciseDTO {
  return {
    id: se.id,
    sessionId: se.sessionId,
    exerciseId: se.exerciseId,
    planExerciseId: se.planExerciseId,
    order: se.order,
    notes: se.notes,
    exercise: mapExercise(se.exercise),
    sets: se.sets.map(mapSessionSet),
  };
}

export function mapSession(s: SessionWithRelations): SessionDetailDTO {
  return {
    id: s.id,
    planId: s.planId,
    planName: s.plan.name,
    workoutId: s.workoutId,
    workoutName: s.workout.name,
    startedAt: s.startedAt.toISOString(),
    finishedAt: s.finishedAt?.toISOString() ?? null,
    notes: s.notes,
    exercises: s.exercises.map(mapSessionExercise),
  };
}

export function mapSessionBase(
  s: Session & { plan: { name: string }; workout: { name: string } },
): SessionDTO {
  return {
    id: s.id,
    planId: s.planId,
    planName: s.plan.name,
    workoutId: s.workoutId,
    workoutName: s.workout.name,
    startedAt: s.startedAt.toISOString(),
    finishedAt: s.finishedAt?.toISOString() ?? null,
    notes: s.notes,
  };
}

export function mapPhotoRow(row: ProgressPhoto) {
  return {
    id: row.id,
    takenAt: row.takenAt.toISOString(),
    weekStartDate: row.weekStartDate.toISOString().slice(0, 10),
    bodyWeightKg: toNumber(row.bodyWeightKg),
    bodyFatPct: toNumber(row.bodyFatPct),
    notes: row.notes,
    width: row.width,
    height: row.height,
    s3Key: row.s3Key,
  };
}

export function mapShareLink(row: ShareLink, baseUrl: string): ShareLinkDTO {
  return {
    id: row.id,
    token: row.token,
    name: row.name,
    scope: row.scope,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    revokedAt: row.revokedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    url: `${baseUrl}/share/${row.token}`,
  };
}
