import "server-only";
import type { PrismaClient } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { errors } from "@/server/presentation/helpers/http";
import type { CreateShareLinkInput, ShareLinkDTO } from "@/lib/schemas/share";
import { mapShareLink } from "./mappers";
import { env } from "@/server/config/env";

export class ShareData {
  constructor(private readonly prisma: PrismaClient) {}

  async list(userId: string): Promise<ShareLinkDTO[]> {
    const rows = await this.prisma.shareLink.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => mapShareLink(r, env.NEXT_PUBLIC_APP_URL));
  }

  async create(userId: string, input: CreateShareLinkInput): Promise<ShareLinkDTO> {
    const token = randomBytes(32).toString("base64url");
    const row = await this.prisma.shareLink.create({
      data: {
        userId,
        token,
        name: input.name ?? null,
        scope: input.scope,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      },
    });
    return mapShareLink(row, env.NEXT_PUBLIC_APP_URL);
  }

  async revoke(id: string, userId: string): Promise<void> {
    const row = await this.prisma.shareLink.findFirst({
      where: { id, userId },
      select: { id: true, revokedAt: true },
    });
    if (!row) throw errors.notFound("Share link not found");
    if (row.revokedAt) return; // already revoked; idempotent
    await this.prisma.shareLink.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async resolveToken(token: string) {
    const link = await this.prisma.shareLink.findUnique({ where: { token } });
    if (!link) return null;
    if (link.revokedAt) return null;
    if (link.expiresAt && link.expiresAt < new Date()) return null;
    return link;
  }
}
