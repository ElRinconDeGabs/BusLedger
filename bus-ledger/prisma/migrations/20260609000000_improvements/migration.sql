-- ============================================================
-- Migration: improvements
-- - TransactionType enum (INGRESO | GASTO) replaces free-text
-- - BusitoStatus enum (ACTIVO | INACTIVO | EN_MANTENIMIENTO)
-- - Transaction.date for backdating
-- - Transaction.category for expense categorization
-- - User.locale / User.currency (persisted preferences)
-- ============================================================

-- Create enums
CREATE TYPE "TransactionType" AS ENUM ('INGRESO', 'GASTO');
CREATE TYPE "BusitoStatus" AS ENUM ('ACTIVO', 'INACTIVO', 'EN_MANTENIMIENTO');

-- Migrate Transaction.type from free-text String to enum
-- Add enum column alongside the old one
ALTER TABLE "Transaction" ADD COLUMN "type_new" "TransactionType";

-- Convert existing string values to enum values
UPDATE "Transaction" SET "type_new" = 'INGRESO' WHERE lower("type") IN ('ingreso', 'income');
UPDATE "Transaction" SET "type_new" = 'GASTO'   WHERE lower("type") = 'gasto';
-- Safety net: any remaining nulls become GASTO
UPDATE "Transaction" SET "type_new" = 'GASTO'   WHERE "type_new" IS NULL;

-- Set NOT NULL constraint
ALTER TABLE "Transaction" ALTER COLUMN "type_new" SET NOT NULL;

-- Drop old string column and rename enum column
ALTER TABLE "Transaction" DROP COLUMN "type";
ALTER TABLE "Transaction" RENAME COLUMN "type_new" TO "type";

-- Add new columns with safe defaults
ALTER TABLE "Busito"      ADD COLUMN "status"   "BusitoStatus" NOT NULL DEFAULT 'ACTIVO';
ALTER TABLE "Transaction" ADD COLUMN "category" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "date"     TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User"        ADD COLUMN "locale"   TEXT           NOT NULL DEFAULT 'es-PA';
ALTER TABLE "User"        ADD COLUMN "currency" TEXT           NOT NULL DEFAULT 'USD';
