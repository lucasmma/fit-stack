import "server-only";
import type { PrismaClient } from "@prisma/client";
import type { ProfileDTO } from "@/lib/schemas/shared/profile";

export class ProfileData {
  constructor(private readonly prisma: PrismaClient) {}

  async getById(userId: string): Promise<ProfileDTO | null> {
    const profile = await this.prisma.profile.findUnique({ where: { id: userId } });
    if (!profile) return null;
    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl,
    };
  }

  async upsert(input: { id: string; email: string; fullName?: string | null }): Promise<ProfileDTO> {
    const profile = await this.prisma.profile.upsert({
      where: { id: input.id },
      create: { id: input.id, email: input.email, fullName: input.fullName ?? null },
      update: { email: input.email, fullName: input.fullName ?? undefined },
    });
    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl,
    };
  }
}
