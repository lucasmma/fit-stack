/**
 * Seeds the "Consultoria Individual de Treinamento (24/07/26)" prescription.
 *
 * Source: plans/Consultoria De Treino L.M.M. (24_07_26).docx.pdf
 *
 * Unlike prisma/seed-plan.ts, this script never deletes a plan that already has
 * logged sessions, and it resolves exercises by name instead of creating them —
 * run `npm run seed:catalog` first so every name below exists in the catalog.
 */
import { randomUUID } from "node:crypto";
import { parseArgs } from "node:util";
import { Prisma, PrismaClient, SetType } from "@prisma/client";

const prisma = new PrismaClient();

type SetSpec = {
  type: SetType;
  label: string;
  targetReps: number | null;
  targetRepsMax: number | null;
  notes?: string;
};

type ExerciseSpec = {
  name: string;
  notes: string;
  sets: SetSpec[];
};

type WorkoutSpec = {
  name: string;
  description: string;
  order: number;
  exercises: ExerciseSpec[];
};

const PLAN_NAME = "Consultoria Individual de Treinamento (24/07/26)";
const PLAN_DESCRIPTION = [
  "Objetivo: ganho de massa muscular e melhora da composição corporal (manutenção do % de gordura).",
  "Divisão semanal: seg = Treino A, ter = Treino B, qua = Treino C, qui = Treino D, sex = Treino C. Sáb e dom: descanso.",
  "Cárdio: 25 minutos/dia.",
  "Abdominal 3x/semana: Abdominal canivete e Abdominal com bracing — 3x 8-Máx (RIR 0–1), descanso 90–120 seg.",
  "Progressão de carga: sempre que alcançar o limite máximo de repetições estipulado na série, aumentar a carga obrigatoriamente.",
  "Os descansos possuem uma margem de tempo para recuperação máxima; caso esteja se sentindo recuperado, iniciar a próxima série.",
].join(" ");

/** "Reconhecimento de carga": 1 set of 2–3 reps at the intended working load. */
const recognition = (): SetSpec => ({
  type: SetType.RECOGNITION,
  label: "2–3",
  targetReps: 2,
  targetRepsMax: 3,
  notes: "Carga de trabalho",
});

/** "Séries válidas". `max` is null for open-ended "N-Máx" prescriptions. */
const working = (
  count: number,
  label: string,
  min: number,
  max: number | null,
  rir?: string,
): SetSpec[] =>
  Array.from({ length: count }, () => ({
    type: SetType.WORKING,
    label,
    targetReps: min,
    targetRepsMax: max,
    notes: rir ? `RIR ${rir}` : undefined,
  }));

/** "Cluster Set": load held across intra-set pauses until the rep target is met. */
const cluster = (reps: number): SetSpec => ({
  type: SetType.CLUSTER,
  label: String(reps),
  targetReps: reps,
  targetRepsMax: reps,
  notes: "Cluster Set",
});

const REST_90_120 = "Descanso: 90 a 120 seg.";
const REST_60_90 = "Descanso: 60 a 90 seg.";
const REST_30_90 = "Descanso: 30 a 90 seg.";
const RECOGNITION_NOTE = "Reconhecimento de carga + séries válidas.";

const WORKOUTS: WorkoutSpec[] = [
  {
    name: "Treino A — Upper Push",
    description: "Segunda-feira",
    order: 0,
    exercises: [
      {
        name: "Supino inclinado halter",
        notes: `${RECOGNITION_NOTE} ${REST_90_120}`,
        sets: [recognition(), ...working(3, "8–10", 8, 10)],
      },
      {
        name: "Supino reto máquina",
        notes: `${RECOGNITION_NOTE} ${REST_90_120}`,
        sets: [recognition(), ...working(2, "8–10", 8, 10)],
      },
      {
        name: "Crucifixo máquina",
        notes: `${RECOGNITION_NOTE} ${REST_90_120}`,
        sets: [recognition(), ...working(2, "8–10", 8, 10)],
      },
      {
        name: "Desenvolvimento halter",
        notes: `${RECOGNITION_NOTE} ${REST_30_90}`,
        sets: [recognition(), ...working(2, "8–10", 8, 10)],
      },
      {
        name: "Elevação lateral polia (altura do quadril)",
        notes: `${REST_60_90} RIR 0–1.`,
        sets: working(2, "8–10", 8, 10, "0–1"),
      },
      {
        name: "Elevação lateral halter",
        notes: `${REST_60_90} RIR 0–1.`,
        sets: working(2, "8–10", 8, 10, "0–1"),
      },
      {
        // PDF: "Tríceps unilateral polia" — same movement as the catalog entry
        // carried over from the previous prescription.
        name: "Tríceps francês unilateral polia",
        notes: `${REST_90_120} RIR 0–1, até a máxima.`,
        sets: working(4, "8-Máx", 8, null, "0–1"),
      },
    ],
  },
  {
    name: "Treino B — Upper Pull",
    description: "Terça-feira",
    order: 1,
    exercises: [
      {
        name: "Barra fixa pegada pronada (com sobrepeso)",
        notes: `${RECOGNITION_NOTE} Descanso: 120 seg.`,
        sets: [recognition(), ...working(3, "8–10", 8, 10)],
      },
      {
        name: "Puxada triângulo",
        notes: `${RECOGNITION_NOTE} ${REST_90_120}`,
        sets: [recognition(), ...working(3, "8–10", 8, 10)],
      },
      {
        name: "Remada curvada com halter",
        notes: `${RECOGNITION_NOTE} ${REST_90_120}`,
        sets: [recognition(), ...working(3, "8–10", 8, 10)],
      },
      {
        name: "Remada sentada polia baixa pegada pronada",
        notes: `${RECOGNITION_NOTE} ${REST_90_120}`,
        sets: [recognition(), ...working(3, "8–10", 8, 10)],
      },
      {
        name: "Crucifixo invertido máquina",
        notes: `${REST_90_120} RIR 0–1.`,
        sets: working(3, "8–10", 8, 10, "0–1"),
      },
      {
        name: "Rosca direta polia baixa",
        notes: `${REST_60_90} RIR 0–1.`,
        sets: working(4, "8–10", 8, 10, "0–1"),
      },
    ],
  },
  {
    name: "Treino C — Lower",
    description: "Quarta-feira e sexta-feira",
    order: 2,
    exercises: [
      {
        name: "Cadeira flexora",
        notes: `${REST_90_120} RIR 0–1, até a máxima.`,
        sets: working(2, "10-Máx", 10, null, "0–1"),
      },
      {
        name: "Stiff halter",
        notes: `${RECOGNITION_NOTE} Cluster Set na última série. ${REST_90_120}`,
        sets: [recognition(), ...working(2, "8–10", 8, 10), cluster(12)],
      },
      {
        name: "Leg press",
        notes: `${RECOGNITION_NOTE} Cluster Set na última série. ${REST_90_120}`,
        sets: [recognition(), ...working(2, "8–10", 8, 10), cluster(12)],
      },
      {
        name: "Agachamento livre ou Smith",
        notes: `${RECOGNITION_NOTE} ${REST_90_120}`,
        sets: [recognition(), ...working(3, "8–10", 8, 10)],
      },
      {
        name: "Cadeira abdutora",
        notes: `${REST_90_120} RIR 0–1.`,
        sets: working(2, "10–12", 10, 12, "0–1"),
      },
      {
        name: "Panturrilha em pé na máquina",
        notes: `${REST_90_120} RIR 0–1.`,
        sets: working(5, "10–12", 10, 12, "0–1"),
      },
    ],
  },
  {
    name: "Treino D — Upper Push/Pull",
    description: "Quinta-feira",
    order: 3,
    exercises: [
      {
        name: "Supino inclinado halter",
        notes: `${RECOGNITION_NOTE} ${REST_90_120}`,
        sets: [recognition(), ...working(3, "8–10", 8, 10)],
      },
      {
        name: "Supino reto máquina",
        notes: `${RECOGNITION_NOTE} ${REST_90_120}`,
        sets: [recognition(), ...working(2, "8–10", 8, 10)],
      },
      {
        name: "Crucifixo máquina",
        notes: `${RECOGNITION_NOTE} ${REST_90_120}`,
        sets: [recognition(), ...working(2, "8–10", 8, 10)],
      },
      {
        name: "Puxada triângulo",
        notes: `${RECOGNITION_NOTE} ${REST_90_120}`,
        sets: [recognition(), ...working(3, "8–10", 8, 10)],
      },
      {
        name: "Remada curvada com halter",
        notes: `${RECOGNITION_NOTE} ${REST_30_90}`,
        sets: [recognition(), ...working(3, "8–10", 8, 10)],
      },
      {
        name: "Elevação lateral polia (altura do quadril)",
        notes: `Séries válidas. ${REST_90_120}`,
        sets: working(3, "8–10", 8, 10),
      },
    ],
  },
];

async function resolveExercises(ownerId: string) {
  const names = [...new Set(WORKOUTS.flatMap((w) => w.exercises.map((e) => e.name)))];
  const rows = await prisma.exercise.findMany({
    where: { name: { in: names }, OR: [{ ownerId }, { ownerId: null }] },
  });

  // Prefer a user-owned row over the global catalog entry when both exist.
  const byName = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    const current = byName.get(row.name);
    if (!current || (current.ownerId === null && row.ownerId !== null)) {
      byName.set(row.name, row);
    }
  }

  const missing = names.filter((n) => !byName.has(n));
  if (missing.length > 0) {
    throw new Error(
      `Missing exercises in the catalog:\n  - ${missing.join("\n  - ")}\n` +
        `Run \`npm run seed:catalog\` first.`,
    );
  }
  return byName;
}

async function main() {
  const { values } = parseArgs({
    options: {
      email: { type: "string" },
      activate: { type: "boolean", default: true },
    },
  });

  if (!values.email) {
    console.error("Usage: npm run seed:plan:consultoria -- --email <email> [--no-activate]");
    process.exit(1);
  }

  const profile = await prisma.profile.findUnique({ where: { email: values.email } });
  if (!profile) {
    console.error(`No profile found for ${values.email}. Run \`npm run seed:user\` first.`);
    process.exit(1);
  }

  const exercises = await resolveExercises(profile.id);

  // Idempotency: only re-create this plan when nothing has been logged against
  // it. Sessions reference plans with onDelete: Restrict, so a plan with
  // history must never be dropped.
  const existing = await prisma.plan.findFirst({
    where: { userId: profile.id, name: PLAN_NAME },
    include: { _count: { select: { sessions: true } } },
  });
  if (existing) {
    if (existing._count.sessions > 0) {
      console.error(
        `Plan "${PLAN_NAME}" already exists with ${existing._count.sessions} logged session(s). ` +
          `Refusing to replace it — rename or edit it in the app instead.`,
      );
      process.exit(1);
    }
    await prisma.plan.delete({ where: { id: existing.id } });
    console.log(`Replaced previous copy of "${PLAN_NAME}" (no sessions logged).`);
  }

  // IDs are generated client-side so the whole tree can go in as three
  // createMany calls. Row-by-row inserts against a remote database blow the
  // interactive-transaction timeout.
  const planId = randomUUID();
  const workoutRows: Prisma.WorkoutCreateManyInput[] = [];
  const planExerciseRows: Prisma.PlanExerciseCreateManyInput[] = [];
  const planSetRows: Prisma.PlanSetCreateManyInput[] = [];

  for (const workoutSpec of WORKOUTS) {
    const workoutId = randomUUID();
    workoutRows.push({
      id: workoutId,
      planId,
      name: workoutSpec.name,
      description: workoutSpec.description,
      order: workoutSpec.order,
    });

    for (const [exIdx, exSpec] of workoutSpec.exercises.entries()) {
      const planExerciseId = randomUUID();
      planExerciseRows.push({
        id: planExerciseId,
        workoutId,
        exerciseId: exercises.get(exSpec.name)!.id,
        order: exIdx,
        notes: exSpec.notes,
      });

      exSpec.sets.forEach((s, sIdx) => {
        planSetRows.push({
          id: randomUUID(),
          planExerciseId,
          order: sIdx,
          type: s.type,
          label: s.label,
          targetReps: s.targetReps,
          targetRepsMax: s.targetRepsMax,
          notes: s.notes ?? null,
        });
      });
    }
  }

  const plan = await prisma.$transaction(
    async (tx) => {
      if (values.activate) {
        // Deactivate other plans only — their sessions and archivedAt are untouched.
        await tx.plan.updateMany({
          where: { userId: profile.id, isActive: true },
          data: { isActive: false },
        });
      }

      const created = await tx.plan.create({
        data: {
          id: planId,
          userId: profile.id,
          name: PLAN_NAME,
          description: PLAN_DESCRIPTION,
          isActive: values.activate ?? true,
        },
      });

      await tx.workout.createMany({ data: workoutRows });
      await tx.planExercise.createMany({ data: planExerciseRows });
      await tx.planSet.createMany({ data: planSetRows });

      return created;
    },
    { timeout: 30_000, maxWait: 10_000 },
  );

  console.log(
    `Plan seeded for ${profile.email}: "${plan.name}" — ${workoutRows.length} workouts, ` +
      `${planExerciseRows.length} exercises, ${planSetRows.length} sets. active=${plan.isActive}`,
  );
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
