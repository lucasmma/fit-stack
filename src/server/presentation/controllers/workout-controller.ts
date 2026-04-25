import "server-only";
import type { Handler } from "@/server/presentation/protocols/http";
import type { WorkoutData } from "@/server/data/workout-data";
import { ok, created, noContent } from "@/server/presentation/helpers/http";
import type {
  WorkoutDetailDTO,
  PlanExerciseDTO,
  PlanSetDTO,
  CreateWorkoutInput,
  UpdateWorkoutInput,
  AddPlanExerciseInput,
  UpdatePlanExerciseInput,
  CreatePlanSetInput,
  UpdatePlanSetInput,
} from "@/lib/schemas/workout";

type IdParams = { id: string };

export class WorkoutController {
  constructor(private readonly data: WorkoutData) {}

  get: Handler<unknown, unknown, IdParams, WorkoutDetailDTO> = async (req) =>
    ok(await this.data.getDetail(req.params.id, req.auth.userId));

  // Note: when called from `/api/plans/[id]/workouts`, `params.id` is the plan id.
  create: Handler<CreateWorkoutInput, unknown, IdParams, WorkoutDetailDTO> = async (req) =>
    created(await this.data.create(req.params.id, req.auth.userId, req.body));

  update: Handler<UpdateWorkoutInput, unknown, IdParams, WorkoutDetailDTO> = async (req) =>
    ok(await this.data.update(req.params.id, req.auth.userId, req.body));

  delete: Handler<unknown, unknown, IdParams, null> = async (req) => {
    await this.data.delete(req.params.id, req.auth.userId);
    return noContent();
  };

  addExercise: Handler<AddPlanExerciseInput, unknown, IdParams, PlanExerciseDTO> = async (req) =>
    created(await this.data.addExercise(req.params.id, req.auth.userId, req.body));

  updateExercise: Handler<UpdatePlanExerciseInput, unknown, IdParams, PlanExerciseDTO> = async (
    req,
  ) => ok(await this.data.updateExercise(req.params.id, req.auth.userId, req.body));

  removeExercise: Handler<unknown, unknown, IdParams, null> = async (req) => {
    await this.data.removeExercise(req.params.id, req.auth.userId);
    return noContent();
  };

  addSet: Handler<CreatePlanSetInput, unknown, IdParams, PlanSetDTO> = async (req) =>
    created(await this.data.addSet(req.params.id, req.auth.userId, req.body));

  updateSet: Handler<UpdatePlanSetInput, unknown, IdParams, PlanSetDTO> = async (req) =>
    ok(await this.data.updateSet(req.params.id, req.auth.userId, req.body));

  removeSet: Handler<unknown, unknown, IdParams, null> = async (req) => {
    await this.data.removeSet(req.params.id, req.auth.userId);
    return noContent();
  };
}
