/*
  Warnings:

  - You are about to drop the column `am` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `userName` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `User` table. All the data in the column will be lost.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Website" ADD COLUMN "bookingId" TEXT;
ALTER TABLE "Website" ADD COLUMN "domainId" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "desc" TEXT,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "assignedToId" INTEGER,
    "amName" TEXT,
    CONSTRAINT "Task_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("category", "createdAt", "desc", "id", "status", "title", "websiteId") SELECT "category", "createdAt", "desc", "id", "status", "title", "websiteId" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "is_manager" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("id", "name", "role") SELECT "id", "name", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
