"use client";

import type {
  CreatePlanInput,
  UpdatePlanInput,
  PlanDTO,
  PlanDetailDTO,
} from "./schemas/plan";
import type {
  CreateWorkoutInput,
  UpdateWorkoutInput,
  WorkoutDetailDTO,
  AddPlanExerciseInput,
  UpdatePlanExerciseInput,
  CreatePlanSetInput,
  UpdatePlanSetInput,
  PlanSetDTO,
  PlanExerciseDTO,
} from "./schemas/workout";
import type {
  CreateSessionInput,
  SessionDTO,
  SessionDetailDTO,
  SessionSummaryDTO,
  UpdateSessionSetInput,
  AddSessionSetInput,
  SessionSetDTO,
  SessionExerciseDTO,
  AddSessionExerciseInput,
} from "./schemas/session";
import type { ExerciseDTO, CreateExerciseInput } from "./schemas/exercise";
import type {
  PresignInput,
  PresignDTO,
  ConfirmPhotoInput,
  ConfirmPhotoSetInput,
  PhotoDTO,
} from "./schemas/photo";
import type { CreateShareLinkInput, ShareLinkDTO } from "./schemas/share";
import type { ProfileDTO } from "./schemas/profile";

class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly issues?: unknown,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  init?: RequestInit & { json?: unknown; query?: Record<string, string | number | undefined> },
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("x-requested-with", "fit-stack");

  let body: BodyInit | null = null;
  if (init?.json !== undefined) {
    headers.set("content-type", "application/json");
    body = JSON.stringify(init.json);
  }

  let url = path;
  if (init?.query) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(init.query)) {
      if (v !== undefined && v !== null) params.set(k, String(v));
    }
    const q = params.toString();
    if (q) url = `${path}?${q}`;
  }

  const res = await fetch(url, { ...init, headers, body, credentials: "include" });

  if (res.status === 204) return undefined as T;

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      res.status,
      payload?.code ?? "ERROR",
      payload?.message ?? res.statusText,
      payload?.issues,
    );
  }

  return payload as T;
}

export const api = {
  me: {
    get: () => request<ProfileDTO>("/api/me"),
  },
  plans: {
    list: () => request<PlanDTO[]>("/api/plans"),
    get: (id: string) => request<PlanDetailDTO>(`/api/plans/${id}`),
    create: (input: CreatePlanInput) => request<PlanDTO>("/api/plans", { method: "POST", json: input }),
    update: (id: string, input: UpdatePlanInput) =>
      request<PlanDTO>(`/api/plans/${id}`, { method: "PATCH", json: input }),
    delete: (id: string) => request<void>(`/api/plans/${id}`, { method: "DELETE" }),
    activate: (id: string) =>
      request<PlanDTO>(`/api/plans/${id}/activate`, { method: "POST", json: {} }),
  },
  workouts: {
    create: (planId: string, input: CreateWorkoutInput) =>
      request<WorkoutDetailDTO>(`/api/plans/${planId}/workouts`, { method: "POST", json: input }),
    get: (id: string) => request<WorkoutDetailDTO>(`/api/workouts/${id}`),
    update: (id: string, input: UpdateWorkoutInput) =>
      request<WorkoutDetailDTO>(`/api/workouts/${id}`, { method: "PATCH", json: input }),
    delete: (id: string) => request<void>(`/api/workouts/${id}`, { method: "DELETE" }),
    addExercise: (workoutId: string, input: AddPlanExerciseInput) =>
      request<PlanExerciseDTO>(`/api/workouts/${workoutId}/exercises`, {
        method: "POST",
        json: input,
      }),
    updateExercise: (planExerciseId: string, input: UpdatePlanExerciseInput) =>
      request<PlanExerciseDTO>(`/api/plan-exercises/${planExerciseId}`, {
        method: "PATCH",
        json: input,
      }),
    removeExercise: (planExerciseId: string) =>
      request<void>(`/api/plan-exercises/${planExerciseId}`, { method: "DELETE" }),
    addSet: (planExerciseId: string, input: CreatePlanSetInput) =>
      request<PlanSetDTO>(`/api/plan-exercises/${planExerciseId}/sets`, {
        method: "POST",
        json: input,
      }),
    updateSet: (planSetId: string, input: UpdatePlanSetInput) =>
      request<PlanSetDTO>(`/api/plan-sets/${planSetId}`, { method: "PATCH", json: input }),
    removeSet: (planSetId: string) =>
      request<void>(`/api/plan-sets/${planSetId}`, { method: "DELETE" }),
  },
  exercises: {
    list: (query?: { q?: string }) =>
      request<ExerciseDTO[]>("/api/exercises", { query }),
    create: (input: CreateExerciseInput) =>
      request<ExerciseDTO>("/api/exercises", { method: "POST", json: input }),
  },
  sessions: {
    list: (query?: { from?: string; to?: string }) =>
      request<SessionSummaryDTO[]>("/api/sessions", { query }),
    get: (id: string) => request<SessionDetailDTO>(`/api/sessions/${id}`),
    create: (input: CreateSessionInput) =>
      request<SessionDetailDTO>("/api/sessions", { method: "POST", json: input }),
    finish: (id: string) =>
      request<SessionDTO>(`/api/sessions/${id}/finish`, { method: "POST", json: {} }),
    updateSet: (setId: string, input: UpdateSessionSetInput) =>
      request<SessionSetDTO>(`/api/session-sets/${setId}`, { method: "PATCH", json: input }),
    deleteSet: (setId: string) =>
      request<void>(`/api/session-sets/${setId}`, { method: "DELETE" }),
    addSet: (sessionExerciseId: string, input: AddSessionSetInput) =>
      request<SessionSetDTO>(`/api/session-exercises/${sessionExerciseId}/sets`, {
        method: "POST",
        json: input,
      }),
    addExercise: (sessionId: string, input: AddSessionExerciseInput) =>
      request<SessionExerciseDTO>(`/api/sessions/${sessionId}/exercises`, {
        method: "POST",
        json: input,
      }),
  },
  dashboard: {
    volume: (weeks: number) =>
      request<Array<{ weekStart: string; volume: number; sessions: number }>>(
        "/api/dashboard/volume",
        { query: { weeks } },
      ),
    exerciseProgression: (exerciseId: string) =>
      request<Array<{ date: string; topWeight: number; estimatedOneRm: number }>>(
        `/api/dashboard/exercise/${exerciseId}/progression`,
      ),
    prs: (limit = 5) =>
      request<Array<{ exerciseId: string; exerciseName: string; weight: number; date: string }>>(
        "/api/dashboard/prs",
        { query: { limit } },
      ),
    bodyWeight: () =>
      request<Array<{ date: string; bodyWeightKg: number }>>("/api/dashboard/body-weight"),
  },
  photos: {
    list: (query?: { from?: string; to?: string }) =>
      request<PhotoDTO[]>("/api/photos", { query }),
    presign: (input: PresignInput) =>
      request<PresignDTO>("/api/photos/presign", { method: "POST", json: input }),
    confirm: (input: ConfirmPhotoInput) =>
      request<PhotoDTO>("/api/photos/confirm", { method: "POST", json: input }),
    confirmSet: (input: ConfirmPhotoSetInput) =>
      request<PhotoDTO[]>("/api/photos/sets", { method: "POST", json: input }),
    delete: (id: string) => request<void>(`/api/photos/${id}`, { method: "DELETE" }),
  },
  shareLinks: {
    list: () => request<ShareLinkDTO[]>("/api/share-links"),
    create: (input: CreateShareLinkInput) =>
      request<ShareLinkDTO>("/api/share-links", { method: "POST", json: input }),
    revoke: (id: string) => request<void>(`/api/share-links/${id}`, { method: "DELETE" }),
  },
};

export { ApiError };
