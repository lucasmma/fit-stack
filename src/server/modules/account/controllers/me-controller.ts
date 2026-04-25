import "server-only";
import type { Handler } from "@/server/shared/presentation/protocols/http";
import type { ProfileData } from "@/server/modules/account/data/profile-data";
import { ok } from "@/server/shared/presentation/helpers/http";
import { assertExists } from "@/server/shared/presentation/helpers/assert";
import type { ProfileDTO } from "@/lib/schemas/shared/profile";

export class MeController {
  constructor(private readonly profileData: ProfileData) {}

  get: Handler<unknown, unknown, unknown, ProfileDTO> = async (req) => {
    const profile = await this.profileData.getById(req.auth.userId);
    return ok(
      assertExists(profile, "Profile not found. Ask an admin to provision your account."),
    );
  };
}
