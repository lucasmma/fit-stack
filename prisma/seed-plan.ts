import { parseArgs } from "node:util";
import { PrismaClient, SetType } from "@prisma/client";

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
  muscleGroup: string;
  equipment: string;
  notes: string;
  sets: SetSpec[];
};

type WorkoutSpec = {
  name: string;
  description?: string;
  order: number;
  exercises: ExerciseSpec[];
};

const PLAN_NAME = "Prescrição Individual de Treinamento";
const PLAN_DESCRIPTION =
  "Hipertrofia: ganho de massa muscular e melhora da composição corporal. Cárdio: 120 min/semana. Sempre que alcançar o limite máximo de repetições, aumentar a carga.";

// "Reconhecimento de carga" + "Séries válidas": 1 recognition set + 3 working sets.
const recognitionPlusWorking = (
  reps: string,
  lowerBound: number,
  upperBound: number,
): SetSpec[] => [
  { type: SetType.RECOGNITION, label: reps, targetReps: lowerBound, targetRepsMax: upperBound },
  { type: SetType.WORKING, label: reps, targetReps: lowerBound, targetRepsMax: upperBound },
  { type: SetType.WORKING, label: reps, targetReps: lowerBound, targetRepsMax: upperBound },
  { type: SetType.WORKING, label: reps, targetReps: lowerBound, targetRepsMax: upperBound },
];

const workingSets = (
  count: number,
  reps: string,
  lowerBound: number | null,
  upperBound: number | null,
  rir?: string,
): SetSpec[] =>
  Array.from({ length: count }, () => ({
    type: SetType.WORKING,
    label: reps,
    targetReps: lowerBound,
    targetRepsMax: upperBound,
    notes: rir ? `RIR ${rir}` : undefined,
  }));

const WORKOUTS: WorkoutSpec[] = [
  {
    name: "Treino A — Upper Push",
    order: 0,
    exercises: [
      {
        name: "Supino inclinado halter",
        muscleGroup: "Peito",
        equipment: "Halter",
        notes: "Reconhecimento + Séries válidas. Descanso: 90 a 120 seg.",
        sets: recognitionPlusWorking("8-10", 8, 10),
      },
      {
        name: "Crucifixo máquina",
        muscleGroup: "Peito",
        equipment: "Máquina",
        notes: "Reconhecimento + Séries válidas. Descanso: 90 a 120 seg.",
        sets: recognitionPlusWorking("8-10", 8, 10),
      },
      {
        name: "Desenvolvimento halter",
        muscleGroup: "Ombros",
        equipment: "Halter",
        notes: "Reconhecimento + Séries válidas. Descanso: 90 a 120 seg.",
        sets: recognitionPlusWorking("8-10", 8, 10),
      },
      {
        name: "Elevação lateral polia (altura do quadril)",
        muscleGroup: "Ombros",
        equipment: "Polia",
        notes: "Reconhecimento + Séries válidas. Descanso: 30 a 90 seg.",
        sets: recognitionPlusWorking("8-10", 8, 10),
      },
      {
        name: "Elevação lateral halter",
        muscleGroup: "Ombros",
        equipment: "Halter",
        notes: "Descanso: 60 a 90 seg. RIR 0-1.",
        sets: workingSets(2, "8-10", 8, 10, "0-1"),
      },
      {
        name: "Tríceps francês unilateral polia",
        muscleGroup: "Braços",
        equipment: "Polia",
        notes: "Descanso: 60 a 90 seg. RIR 0-1.",
        sets: workingSets(4, "8-10", 8, 10, "0-1"),
      },
      {
        name: "Abdominal canivete",
        muscleGroup: "Core",
        equipment: "Peso corporal",
        notes: "Descanso: 90 a 120 seg. RIR 0-1, até a máxima.",
        sets: workingSets(4, "8-Máx", 8, null, "0-1"),
      },
    ],
  },
  {
    name: "Treino B — Upper Pull",
    order: 1,
    exercises: [
      {
        name: "Barra fixa pegada pronada (com sobrepeso)",
        muscleGroup: "Costas",
        equipment: "Peso corporal",
        notes: "Reconhecimento + Séries válidas. Descanso: 120 seg.",
        sets: recognitionPlusWorking("8-10", 8, 10),
      },
      {
        name: "Puxada triângulo",
        muscleGroup: "Costas",
        equipment: "Polia",
        notes: "Reconhecimento + Séries válidas. Descanso: 90 a 120 seg.",
        sets: recognitionPlusWorking("8-10", 8, 10),
      },
      {
        name: "Remada curvada com halter",
        muscleGroup: "Costas",
        equipment: "Halter",
        notes: "Reconhecimento + Séries válidas. Descanso: 90 a 120 seg.",
        sets: recognitionPlusWorking("8-10", 8, 10),
      },
      {
        name: "Remada sentada polia baixa pegada pronada",
        muscleGroup: "Costas",
        equipment: "Polia",
        notes: "Reconhecimento + Séries válidas. Descanso: 90 a 120 seg.",
        sets: recognitionPlusWorking("8-10", 8, 10),
      },
      {
        name: "Crucifixo invertido máquina",
        muscleGroup: "Ombros",
        equipment: "Máquina",
        notes: "Descanso: 90 a 120 seg. RIR 0-1.",
        sets: workingSets(3, "8-10", 8, 10, "0-1"),
      },
      {
        name: "Rosca direta banco inclinado",
        muscleGroup: "Braços",
        equipment: "Halter",
        notes: "Descanso: 60 a 90 seg. RIR 0-1.",
        sets: workingSets(4, "10-12", 10, 12, "0-1"),
      },
    ],
  },
  {
    name: "Treino C — Lower",
    order: 2,
    exercises: [
      {
        name: "Cadeira flexora",
        muscleGroup: "Posterior de coxa",
        equipment: "Máquina",
        notes: "Descanso: 90 a 120 seg. RIR 0-1, até a máxima.",
        sets: workingSets(2, "10-Máx", 10, null, "0-1"),
      },
      {
        name: "Stiff halter",
        muscleGroup: "Posterior de coxa",
        equipment: "Halter",
        notes: "Reconhecimento + Séries válidas. Descanso: 90 a 120 seg.",
        sets: recognitionPlusWorking("8-10", 8, 10),
      },
      {
        name: "Leg press",
        muscleGroup: "Pernas",
        equipment: "Máquina",
        notes: "Reconhecimento + Séries válidas. Descanso: 90 a 120 seg.",
        sets: recognitionPlusWorking("8-10", 8, 10),
      },
      {
        name: "Agachamento livre ou Smith",
        muscleGroup: "Pernas",
        equipment: "Barra/Smith",
        notes: "Reconhecimento + Séries válidas. Descanso: 90 a 120 seg.",
        sets: recognitionPlusWorking("8-10", 8, 10),
      },
      {
        name: "Cadeira abdutora",
        muscleGroup: "Glúteos",
        equipment: "Máquina",
        notes: "Descanso: 90 a 120 seg. RIR 0-1.",
        sets: workingSets(2, "10-12", 10, 12, "0-1"),
      },
      {
        name: "Panturrilha em pé na máquina",
        muscleGroup: "Panturrilha",
        equipment: "Máquina",
        notes: "Descanso: 90 a 120 seg. RIR 0-1.",
        sets: workingSets(5, "10-12", 10, 12, "0-1"),
      },
    ],
  },
  {
    name: "Treino D — Upper Push/Pull",
    order: 3,
    exercises: [
      {
        name: "Supino inclinado halter",
        muscleGroup: "Peito",
        equipment: "Halter",
        notes: "Reconhecimento + Séries válidas. Descanso: 90 a 120 seg.",
        sets: recognitionPlusWorking("8-10", 8, 10),
      },
      {
        name: "Crucifixo máquina",
        muscleGroup: "Peito",
        equipment: "Máquina",
        notes: "Reconhecimento + Séries válidas. Descanso: 90 a 120 seg.",
        sets: recognitionPlusWorking("8-10", 8, 10),
      },
      {
        name: "Puxada triângulo",
        muscleGroup: "Costas",
        equipment: "Polia",
        notes: "Reconhecimento + Séries válidas. Descanso: 90 a 120 seg.",
        sets: recognitionPlusWorking("8-10", 8, 10),
      },
      {
        name: "Remada curvada com halter",
        muscleGroup: "Costas",
        equipment: "Halter",
        notes: "Reconhecimento + Séries válidas. Descanso: 90 a 120 seg.",
        sets: recognitionPlusWorking("8-10", 8, 10),
      },
      {
        name: "Elevação lateral polia (altura do quadril)",
        muscleGroup: "Ombros",
        equipment: "Polia",
        notes: "Reconhecimento + Séries válidas. Descanso: 30 a 90 seg.",
        sets: recognitionPlusWorking("8-10", 8, 10),
      },
      {
        name: "Abdominal máquina",
        muscleGroup: "Core",
        equipment: "Máquina",
        notes: "Descanso: 90 a 120 seg. RIR 0-1, até a máxima.",
        sets: workingSets(4, "8-Máx", 8, null, "0-1"),
      },
    ],
  },
];

async function findOrCreateExercise(spec: {
  name: string;
  muscleGroup: string;
  equipment: string;
  ownerId: string;
}) {
  const existingOwned = await prisma.exercise.findFirst({
    where: { name: spec.name, ownerId: spec.ownerId },
  });
  if (existingOwned) return existingOwned;

  const existingGlobal = await prisma.exercise.findFirst({
    where: { name: spec.name, ownerId: null },
  });
  if (existingGlobal) return existingGlobal;

  return prisma.exercise.create({ data: spec });
}

async function main() {
  const { values } = parseArgs({
    options: {
      email: { type: "string" },
      activate: { type: "boolean", default: true },
    },
  });

  if (!values.email) {
    console.error("Usage: npm run seed:plan -- --email <email> [--no-activate]");
    process.exit(1);
  }

  const profile = await prisma.profile.findUnique({
    where: { email: values.email },
  });
  if (!profile) {
    console.error(
      `No profile found for ${values.email}. Run \`npm run seed:user\` first.`,
    );
    process.exit(1);
  }

  // Idempotency: drop any prior copy of this plan for this user.
  // Cascades clean up workouts, plan_exercises, and plan_sets.
  const existingPlan = await prisma.plan.findFirst({
    where: { userId: profile.id, name: PLAN_NAME },
  });
  if (existingPlan) {
    await prisma.plan.delete({ where: { id: existingPlan.id } });
  }

  if (values.activate) {
    await prisma.plan.updateMany({
      where: { userId: profile.id, isActive: true },
      data: { isActive: false },
    });
  }

  const plan = await prisma.plan.create({
    data: {
      userId: profile.id,
      name: PLAN_NAME,
      description: PLAN_DESCRIPTION,
      isActive: values.activate ?? true,
    },
  });

  let exerciseCount = 0;
  let setCount = 0;

  for (const workoutSpec of WORKOUTS) {
    const workout = await prisma.workout.create({
      data: {
        planId: plan.id,
        name: workoutSpec.name,
        description: workoutSpec.description,
        order: workoutSpec.order,
      },
    });

    for (const [exIdx, exSpec] of workoutSpec.exercises.entries()) {
      const exercise = await findOrCreateExercise({
        name: exSpec.name,
        muscleGroup: exSpec.muscleGroup,
        equipment: exSpec.equipment,
        ownerId: profile.id,
      });

      const planExercise = await prisma.planExercise.create({
        data: {
          workoutId: workout.id,
          exerciseId: exercise.id,
          order: exIdx,
          notes: exSpec.notes,
        },
      });
      exerciseCount += 1;

      await prisma.planSet.createMany({
        data: exSpec.sets.map((s, sIdx) => ({
          planExerciseId: planExercise.id,
          order: sIdx,
          type: s.type,
          label: s.label,
          targetReps: s.targetReps,
          targetRepsMax: s.targetRepsMax,
          notes: s.notes,
        })),
      });
      setCount += exSpec.sets.length;
    }
  }

  console.log(
    `Plan seeded for ${profile.email}: "${plan.name}" — ${WORKOUTS.length} workouts, ${exerciseCount} exercises, ${setCount} sets. active=${plan.isActive}`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
