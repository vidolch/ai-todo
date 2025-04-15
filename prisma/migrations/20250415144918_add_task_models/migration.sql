/*
  Warnings:

  - You are about to drop the column `severity` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "List" ADD COLUMN     "color" TEXT,
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "color" TEXT;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "severity";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "preferences" JSONB,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE INDEX "List_userId_idx" ON "List"("userId");

-- CreateIndex
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");

-- CreateIndex
CREATE INDEX "Task_userId_idx" ON "Task"("userId");

-- CreateIndex
CREATE INDEX "Task_listId_idx" ON "Task"("listId");
