import "server-only";
import type { Handler } from "@/server/shared/presentation/protocols/http";
import type { ShareData } from "@/server/modules/fitness/data/share-data";
import { ok, created, noContent } from "@/server/shared/presentation/helpers/http";
import type { CreateShareLinkInput, ShareLinkDTO } from "@/lib/schemas/fitness/share";

type IdParams = { id: string };

export class ShareController {
  constructor(private readonly data: ShareData) {}

  list: Handler<unknown, unknown, unknown, ShareLinkDTO[]> = async (req) =>
    ok(await this.data.list(req.auth.userId));

  create: Handler<CreateShareLinkInput, unknown, unknown, ShareLinkDTO> = async (req) =>
    created(await this.data.create(req.auth.userId, req.body));

  revoke: Handler<unknown, unknown, IdParams, null> = async (req) => {
    await this.data.revoke(req.params.id, req.auth.userId);
    return noContent();
  };
}
