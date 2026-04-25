import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const rows = await prisma.planSet.findMany({
  take: 10,
  select: { id: true, label: true, targetReps: true, targetRepsMax: true },
  orderBy: { order: "asc" },
});
console.log(JSON.stringify(rows, null, 2));
await prisma.$disconnect();
