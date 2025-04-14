-- CreateTable
CREATE TABLE "Replay" (
  "id" TEXT NOT NULL,
  "ballchasingId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),

  CONSTRAINT "Replay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Replay_ballchasingId_key" ON "Replay"("ballchasingId"); 