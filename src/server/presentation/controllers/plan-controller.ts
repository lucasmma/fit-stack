import "server-only";
import type { Handler } from "@/server/presentation/protocols/http";
import type { PlanData } from "@/server/data/plan-data";
import { ok, created, noContent } from "@/server/presentation/helpers/http";
import type {
  CreatePlanInput,
  UpdatePlanInput,
  PlanDTO,
  PlanDetailDTO,
} from "@/lib/schemas/plan";

type IdParams = { id: string };

export class PlanController {
  constructor(private readonly data: PlanData) {}

  list: Handler<unknown, unknown, unknown, PlanDTO[]> = async (req) =>
    ok(await this.data.list(req.auth.userId));

  get: Handler<unknown, unknown, IdParams, PlanDetailDTO> = async (req) =>
    ok(await this.data.getDetail(req.params.id, req.auth.userId));

  create: Handler<CreatePlanInput, unknown, unknown, PlanDTO> = async (req) =>
    created(await this.data.create(req.auth.userId, req.body));

  update: Handler<UpdatePlanInput, unknown, IdParams, PlanDTO> = async (req) =>
    ok(await this.data.update(req.params.id, req.auth.userId, req.body));

  delete: Handler<unknown, unknown, IdParams, null> = async (req) => {
    await this.data.delete(req.params.id, req.auth.userId);
    return noContent();
  };

  activate: Handler<unknown, unknown, IdParams, PlanDTO> = async (req) =>
    ok(await this.data.activate(req.params.id, req.auth.userId));
}
