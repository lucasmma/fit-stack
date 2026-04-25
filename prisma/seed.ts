import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATALOG: Array<{
  name: string;
  muscleGroup: string;
  equipment: string;
}> = [
  // Peito
  { name: "Supino reto barra", muscleGroup: "Peito", equipment: "Barra" },
  { name: "Supino reto halter", muscleGroup: "Peito", equipment: "Halter" },
  { name: "Supino inclinado barra", muscleGroup: "Peito", equipment: "Barra" },
  { name: "Supino inclinado halter", muscleGroup: "Peito", equipment: "Halter" },
  { name: "Supino declinado", muscleGroup: "Peito", equipment: "Barra" },
  { name: "Crucifixo halter", muscleGroup: "Peito", equipment: "Halter" },
  { name: "Crucifixo máquina", muscleGroup: "Peito", equipment: "Máquina" },
  { name: "Crossover na polia", muscleGroup: "Peito", equipment: "Polia" },
  { name: "Mergulho nas paralelas", muscleGroup: "Peito", equipment: "Peso corporal" },

  // Costas
  { name: "Levantamento terra", muscleGroup: "Costas", equipment: "Barra" },
  { name: "Barra fixa pegada pronada", muscleGroup: "Costas", equipment: "Peso corporal" },
  { name: "Barra fixa pegada pronada (com sobrepeso)", muscleGroup: "Costas", equipment: "Peso corporal" },
  { name: "Barra fixa pegada supinada", muscleGroup: "Costas", equipment: "Peso corporal" },
  { name: "Puxada frontal", muscleGroup: "Costas", equipment: "Polia" },
  { name: "Puxada triângulo", muscleGroup: "Costas", equipment: "Polia" },
  { name: "Remada curvada com barra", muscleGroup: "Costas", equipment: "Barra" },
  { name: "Remada curvada com halter", muscleGroup: "Costas", equipment: "Halter" },
  { name: "Remada cavalinho", muscleGroup: "Costas", equipment: "Barra" },
  { name: "Remada unilateral halter", muscleGroup: "Costas", equipment: "Halter" },
  { name: "Remada sentada polia baixa pegada pronada", muscleGroup: "Costas", equipment: "Polia" },
  { name: "Remada sentada polia baixa pegada neutra", muscleGroup: "Costas", equipment: "Polia" },
  { name: "Pullover halter", muscleGroup: "Costas", equipment: "Halter" },

  // Ombros
  { name: "Desenvolvimento militar", muscleGroup: "Ombros", equipment: "Barra" },
  { name: "Desenvolvimento halter", muscleGroup: "Ombros", equipment: "Halter" },
  { name: "Desenvolvimento máquina", muscleGroup: "Ombros", equipment: "Máquina" },
  { name: "Elevação lateral halter", muscleGroup: "Ombros", equipment: "Halter" },
  { name: "Elevação lateral polia (altura do quadril)", muscleGroup: "Ombros", equipment: "Polia" },
  { name: "Elevação frontal halter", muscleGroup: "Ombros", equipment: "Halter" },
  { name: "Crucifixo invertido máquina", muscleGroup: "Ombros", equipment: "Máquina" },
  { name: "Crucifixo invertido halter", muscleGroup: "Ombros", equipment: "Halter" },
  { name: "Encolhimento halter", muscleGroup: "Trapézio", equipment: "Halter" },

  // Braços — bíceps
  { name: "Rosca direta barra", muscleGroup: "Braços", equipment: "Barra" },
  { name: "Rosca direta banco inclinado", muscleGroup: "Braços", equipment: "Halter" },
  { name: "Rosca alternada halter", muscleGroup: "Braços", equipment: "Halter" },
  { name: "Rosca martelo", muscleGroup: "Braços", equipment: "Halter" },
  { name: "Rosca scott", muscleGroup: "Braços", equipment: "Barra" },
  { name: "Rosca concentrada", muscleGroup: "Braços", equipment: "Halter" },

  // Braços — tríceps
  { name: "Tríceps testa", muscleGroup: "Braços", equipment: "Barra" },
  { name: "Tríceps francês unilateral polia", muscleGroup: "Braços", equipment: "Polia" },
  { name: "Tríceps corda na polia", muscleGroup: "Braços", equipment: "Polia" },
  { name: "Tríceps barra na polia", muscleGroup: "Braços", equipment: "Polia" },
  { name: "Tríceps coice halter", muscleGroup: "Braços", equipment: "Halter" },
  { name: "Tríceps banco", muscleGroup: "Braços", equipment: "Peso corporal" },

  // Pernas — quadríceps / multiarticular
  { name: "Agachamento livre", muscleGroup: "Pernas", equipment: "Barra" },
  { name: "Agachamento livre ou Smith", muscleGroup: "Pernas", equipment: "Barra/Smith" },
  { name: "Agachamento frontal", muscleGroup: "Pernas", equipment: "Barra" },
  { name: "Agachamento búlgaro", muscleGroup: "Pernas", equipment: "Halter" },
  { name: "Leg press", muscleGroup: "Pernas", equipment: "Máquina" },
  { name: "Hack machine", muscleGroup: "Pernas", equipment: "Máquina" },
  { name: "Cadeira extensora", muscleGroup: "Pernas", equipment: "Máquina" },
  { name: "Avanço com halter", muscleGroup: "Pernas", equipment: "Halter" },

  // Pernas — posterior
  { name: "Stiff halter", muscleGroup: "Posterior de coxa", equipment: "Halter" },
  { name: "Stiff barra", muscleGroup: "Posterior de coxa", equipment: "Barra" },
  { name: "Levantamento terra romeno", muscleGroup: "Posterior de coxa", equipment: "Barra" },
  { name: "Cadeira flexora", muscleGroup: "Posterior de coxa", equipment: "Máquina" },
  { name: "Mesa flexora", muscleGroup: "Posterior de coxa", equipment: "Máquina" },

  // Glúteos
  { name: "Hip thrust", muscleGroup: "Glúteos", equipment: "Barra" },
  { name: "Elevação pélvica máquina", muscleGroup: "Glúteos", equipment: "Máquina" },
  { name: "Cadeira abdutora", muscleGroup: "Glúteos", equipment: "Máquina" },
  { name: "Glúteo na polia", muscleGroup: "Glúteos", equipment: "Polia" },

  // Panturrilha
  { name: "Panturrilha em pé na máquina", muscleGroup: "Panturrilha", equipment: "Máquina" },
  { name: "Panturrilha sentado", muscleGroup: "Panturrilha", equipment: "Máquina" },
  { name: "Panturrilha no leg press", muscleGroup: "Panturrilha", equipment: "Máquina" },

  // Core
  { name: "Abdominal canivete", muscleGroup: "Core", equipment: "Peso corporal" },
  { name: "Abdominal máquina", muscleGroup: "Core", equipment: "Máquina" },
  { name: "Abdominal infra", muscleGroup: "Core", equipment: "Peso corporal" },
  { name: "Prancha", muscleGroup: "Core", equipment: "Peso corporal" },
  { name: "Elevação de pernas suspenso", muscleGroup: "Core", equipment: "Peso corporal" },
];

async function main() {
  let inserted = 0;
  let updated = 0;

  for (const exercise of CATALOG) {
    const existing = await prisma.exercise.findFirst({
      where: { name: exercise.name, ownerId: null },
    });
    if (existing) {
      await prisma.exercise.update({
        where: { id: existing.id },
        data: exercise,
      });
      updated += 1;
    } else {
      await prisma.exercise.create({ data: { ...exercise, ownerId: null } });
      inserted += 1;
    }
  }
  console.log(`Catalog seed: ${inserted} inserted, ${updated} updated.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
