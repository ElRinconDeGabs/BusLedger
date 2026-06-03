-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- Seed one default org so existing users can be migrated
INSERT INTO "Organization" ("name") VALUES ('Organizacion Principal');

-- AddColumns to User
ALTER TABLE "User"
    ADD COLUMN "organizationId" INTEGER,
    ADD COLUMN "role" "Role" NOT NULL DEFAULT 'USER';

-- Assign all existing users to the default org
UPDATE "User" SET "organizationId" = (SELECT "id" FROM "Organization" LIMIT 1);

-- Promote the first registered user to ADMIN
UPDATE "User" SET "role" = 'ADMIN' WHERE "id" = (SELECT MIN("id") FROM "User");

-- Make organizationId required
ALTER TABLE "User" ALTER COLUMN "organizationId" SET NOT NULL;

-- AddForeignKey User -> Organization
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddColumn organizationId to Busito
ALTER TABLE "Busito" ADD COLUMN "organizationId" INTEGER;

-- Populate from the bus owner's org
UPDATE "Busito" b SET "organizationId" = u."organizationId"
FROM "User" u WHERE b."userId" = u."id";

-- Make required
ALTER TABLE "Busito" ALTER COLUMN "organizationId" SET NOT NULL;

-- AddForeignKey Busito -> Organization
ALTER TABLE "Busito" ADD CONSTRAINT "Busito_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
