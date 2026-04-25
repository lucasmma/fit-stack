import "server-only";
import type { PrismaClient } from "@prisma/client";
import { mapExercise } from "./mappers";
import type { ExerciseDTO, CreateExerciseInput } from "@/lib/schemas/fitness/exercise";

export class ExerciseData {
  constructor(private readonly prisma: PrismaClient) {}

  async list(userId: string, q?: string): Promise<ExerciseDTO[]> {
    const where = {
      OR: [{ ownerId: null }, { ownerId: userId }],
      ...(q && q.length > 0
        ? { name: { contains: q, mode: "insensitive" as const } }
        : {}),
    };
    const rows = await this.prisma.exercise.findMany({
      where,
      orderBy: [{ ownerId: "asc" }, { name: "asc" }],
      take: 200,
    });
    return rows.map(mapExercise);
  }

  async create(userId: string, input: CreateExerciseInput): Promise<ExerciseDTO> {
    const row = await this.prisma.exercise.create({
      data: {
        name: input.name,
        muscleGroup: input.muscleGroup ?? null,
        equipment: input.equipment ?? null,
        description: input.description ?? null,
        ownerId: userId,
      },
    });
    return mapExercise(row);
  }
}
