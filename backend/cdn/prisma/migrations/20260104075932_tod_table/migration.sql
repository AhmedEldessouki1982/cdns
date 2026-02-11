-- CreateTable
CREATE TABLE "tod" (
    "id" SERIAL NOT NULL,
    "punchId" VARCHAR(50) NOT NULL,
    "system" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "closedAt" TIMESTAMP(3),
    "status" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tod_punchId_key" ON "tod"("punchId");

-- CreateIndex
CREATE INDEX "tod_punchId_idx" ON "tod"("punchId");

-- CreateIndex
CREATE INDEX "tod_system_idx" ON "tod"("system");

-- CreateIndex
CREATE INDEX "tod_status_idx" ON "tod"("status");
