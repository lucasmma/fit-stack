-- CreateEnum
CREATE TYPE "SetType" AS ENUM ('WARMUP', 'WORKING', 'RECOGNITION', 'DROPSET', 'REST_PAUSE', 'FAILURE', 'BACKOFF', 'OTHER');

-- CreateEnum
CREATE TYPE "ShareScope" AS ENUM ('PROGRESS_ONLY', 'WORKOUTS_ONLY', 'ALL');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "muscleGroup" TEXT,
    "equipment" TEXT,
    "description" TEXT,
    "ownerId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workouts" (
    "id" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_exercises" (
    "id" UUID NOT NULL,
    "workoutId" UUID NOT NULL,
    "exerciseId" UUID NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_sets" (
    "id" UUID NOT NULL,
    "planExerciseId" UUID NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "type" "SetType" NOT NULL DEFAULT 'WORKING',
    "label" TEXT,
    "targetReps" INTEGER,
    "targetWeight" DECIMAL(6,2),
    "notes" TEXT,

    CONSTRAINT "plan_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "workoutId" UUID NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_exercises" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "exerciseId" UUID NOT NULL,
    "planExerciseId" UUID,
    "order" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "session_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_sets" (
    "id" UUID NOT NULL,
    "sessionExerciseId" UUID NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "type" "SetType" NOT NULL DEFAULT 'WORKING',
    "label" TEXT,
    "reps" INTEGER,
    "weight" DECIMAL(6,2),
    "rpe" DECIMAL(3,1),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "session_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_photos" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "s3Key" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "bytes" INTEGER,
    "takenAt" TIMESTAMP(3) NOT NULL,
    "weekStartDate" DATE NOT NULL,
    "bodyWeightKg" DECIMAL(5,2),
    "bodyFatPct" DECIMAL(4,1),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "share_links" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "name" TEXT,
    "scope" "ShareScope" NOT NULL DEFAULT 'PROGRESS_ONLY',
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "share_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE INDEX "exercises_ownerId_idx" ON "exercises"("ownerId");

-- CreateIndex
CREATE INDEX "exercises_name_idx" ON "exercises"("name");

-- CreateIndex
CREATE INDEX "plans_userId_idx" ON "plans"("userId");

-- CreateIndex
CREATE INDEX "workouts_planId_idx" ON "workouts"("planId");

-- CreateIndex
CREATE INDEX "plan_exercises_workoutId_idx" ON "plan_exercises"("workoutId");

-- CreateIndex
CREATE INDEX "plan_sets_planExerciseId_idx" ON "plan_sets"("planExerciseId");

-- CreateIndex
CREATE INDEX "sessions_userId_startedAt_idx" ON "sessions"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "session_exercises_sessionId_idx" ON "session_exercises"("sessionId");

-- CreateIndex
CREATE INDEX "session_sets_sessionExerciseId_idx" ON "session_sets"("sessionExerciseId");

-- CreateIndex
CREATE INDEX "progress_photos_userId_takenAt_idx" ON "progress_photos"("userId", "takenAt");

-- CreateIndex
CREATE INDEX "progress_photos_userId_weekStartDate_idx" ON "progress_photos"("userId", "weekStartDate");

-- CreateIndex
CREATE UNIQUE INDEX "share_links_token_key" ON "share_links"("token");

-- CreateIndex
CREATE INDEX "share_links_userId_idx" ON "share_links"("userId");

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_exercises" ADD CONSTRAINT "plan_exercises_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_exercises" ADD CONSTRAINT "plan_exercises_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_sets" ADD CONSTRAINT "plan_sets_planExerciseId_fkey" FOREIGN KEY ("planExerciseId") REFERENCES "plan_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_exercises" ADD CONSTRAINT "session_exercises_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_exercises" ADD CONSTRAINT "session_exercises_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_exercises" ADD CONSTRAINT "session_exercises_planExerciseId_fkey" FOREIGN KEY ("planExerciseId") REFERENCES "plan_exercises"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_sets" ADD CONSTRAINT "session_sets_sessionExerciseId_fkey" FOREIGN KEY ("sessionExerciseId") REFERENCES "session_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_photos" ADD CONSTRAINT "progress_photos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
