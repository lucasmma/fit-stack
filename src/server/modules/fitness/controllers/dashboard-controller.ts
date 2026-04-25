import "server-only";
import type { Handler } from "@/server/shared/presentation/protocols/http";
import type { DashboardData } from "@/server/modules/fitness/data/dashboard-data";
import { ok } from "@/server/shared/presentation/helpers/http";

type VolumeQuery = { weeks: number };
type PrsQuery = { limit: number };
type IdParams = { id: string };

type VolumePoint = { weekStart: string; volume: number; sessions: number };
type ProgressionPoint = { date: string; topWeight: number; estimatedOneRm: number };
type PrRow = { exerciseId: string; exerciseName: string; weight: number; date: string };
type BodyWeightPoint = { date: string; bodyWeightKg: number };

export class DashboardController {
  constructor(private readonly data: DashboardData) {}

  volume: Handler<unknown, VolumeQuery, unknown, VolumePoint[]> = async (req) =>
    ok(await this.data.volumeByWeek(req.auth.userId, req.query.weeks));

  exerciseProgression: Handler<unknown, unknown, IdParams, ProgressionPoint[]> = async (req) =>
    ok(await this.data.exerciseProgression(req.auth.userId, req.params.id));

  prs: Handler<unknown, PrsQuery, unknown, PrRow[]> = async (req) =>
    ok(await this.data.recentPrs(req.auth.userId, req.query.limit));

  bodyWeight: Handler<unknown, unknown, unknown, BodyWeightPoint[]> = async (req) =>
    ok(await this.data.bodyWeightTrend(req.auth.userId));
}
