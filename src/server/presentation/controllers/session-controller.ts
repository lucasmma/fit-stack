import "server-only";
import type { Handler } from "@/server/presentation/protocols/http";
import type { SessionData } from "@/server/data/session-data";
import { ok, created, noContent } from "@/server/presentation/helpers/http";
import type {
  SessionDTO,
  SessionDetailDTO,
  SessionSummaryDTO,
  SessionSetDTO,
  SessionExerciseDTO,
  CreateSessionInput,
  UpdateSessionSetInput,
  AddSessionSetInput,
  AddSessionExerciseInput,
} from "@/lib/schemas/session";

type IdParams = { id: string };
type ListQuery = { from?: string; to?: string };

export class SessionController {
  constructor(private readonly data: SessionData) {}

  list: Handler<unknown, ListQuery, unknown, SessionSummaryDTO[]> = async (req) =>
    ok(await this.data.list(req.auth.userId, req.query ?? {}));

  get: Handler<unknown, unknown, IdParams, SessionDetailDTO> = async (req) =>
    ok(await this.data.getDetail(req.params.id, req.auth.userId));

  create: Handler<CreateSessionInput, unknown, unknown, SessionDetailDTO> = async (req) =>
    created(await this.data.create(req.auth.userId, req.body));

  finish: Handler<unknown, unknown, IdParams, SessionDTO> = async (req) =>
    ok(await this.data.finish(req.params.id, req.auth.userId));

  updateSet: Handler<UpdateSessionSetInput, unknown, IdParams, SessionSetDTO> = async (req) =>
    ok(await this.data.updateSet(req.params.id, req.auth.userId, req.body));

  removeSet: Handler<unknown, unknown, IdParams, null> = async (req) => {
    await this.data.removeSet(req.params.id, req.auth.userId);
    return noContent();
  };

  addSet: Handler<AddSessionSetInput, unknown, IdParams, SessionSetDTO> = async (req) =>
    created(await this.data.addSet(req.params.id, req.auth.userId, req.body));

  addExercise: Handler<AddSessionExerciseInput, unknown, IdParams, SessionExerciseDTO> = async (
    req,
  ) => created(await this.data.addExercise(req.params.id, req.auth.userId, req.body));
}
