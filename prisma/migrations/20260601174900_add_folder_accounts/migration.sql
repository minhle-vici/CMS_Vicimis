-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AccountDetail" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "note" TEXT,
    "isVisibleToTeam" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "folderId" INTEGER,
    CONSTRAINT "AccountDetail_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AccountCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AccountDetail_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AccountDetail" ("categoryId", "createdAt", "id", "isVisibleToTeam", "name", "note", "password", "username") SELECT "categoryId", "createdAt", "id", "isVisibleToTeam", "name", "note", "password", "username" FROM "AccountDetail";
DROP TABLE "AccountDetail";
ALTER TABLE "new_AccountDetail" RENAME TO "AccountDetail";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
