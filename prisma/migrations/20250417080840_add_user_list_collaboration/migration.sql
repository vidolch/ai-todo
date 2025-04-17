/*
  Warnings:

  - You are about to drop the column `userId` on the `List` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CollaborationRole" AS ENUM ('OWNER', 'CONTRIBUTOR');

-- CreateTable
CREATE TABLE "UserList" (
    "id" TEXT NOT NULL,
    "role" "CollaborationRole" NOT NULL DEFAULT 'CONTRIBUTOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "listId" TEXT NOT NULL,

    CONSTRAINT "UserList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserList_userId_idx" ON "UserList"("userId");

-- CreateIndex
CREATE INDEX "UserList_listId_idx" ON "UserList"("listId");

-- CreateIndex
CREATE UNIQUE INDEX "UserList_userId_listId_key" ON "UserList"("userId", "listId");

-- AddForeignKey
ALTER TABLE "UserList" ADD CONSTRAINT "UserList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserList" ADD CONSTRAINT "UserList_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data migration: Transfer existing list ownership data
DO $$
DECLARE
  list_record RECORD;
BEGIN
  -- Insert records into the new UserList table
  FOR list_record IN (SELECT id, "userId" FROM "List" WHERE "userId" IS NOT NULL) LOOP
    INSERT INTO "UserList" (id, role, "createdAt", "updatedAt", "userId", "listId")
    VALUES (
      gen_random_uuid(), -- Generate a new UUID for the id
      'OWNER',          -- Set role to OWNER for existing relationships
      NOW(),            -- Current timestamp for createdAt
      NOW(),            -- Current timestamp for updatedAt
      list_record."userId",
      list_record.id
    );
  END LOOP;
END $$;

-- DropForeignKey
ALTER TABLE "List" DROP CONSTRAINT "List_userId_fkey";

-- DropIndex
DROP INDEX "List_userId_idx";

-- AlterTable
ALTER TABLE "List" DROP COLUMN "userId";
