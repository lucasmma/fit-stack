import "server-only";
import type { Handler } from "@/server/shared/presentation/protocols/http";
import type { ExerciseData } from "@/server/modules/fitness/data/exercise-data";
import { ok, created } from "@/server/shared/presentation/helpers/http";
import type { ExerciseDTO, CreateExerciseInput } from "@/lib/schemas/fitness/exercise";

type ListQuery = { q?: string };

export class ExerciseController {
  constructor(private readonly data: ExerciseData) {}

  list: Handler<unknown, ListQuery, unknown, ExerciseDTO[]> = async (req) =>
    ok(await this.data.list(req.auth.userId, req.query?.q));

  create: Handler<CreateExerciseInput, unknown, unknown, ExerciseDTO> = async (req) =>
    created(await this.data.create(req.auth.userId, req.body));
}
