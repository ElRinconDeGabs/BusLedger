-- DropForeignKey
ALTER TABLE "Busito" DROP CONSTRAINT "Busito_userId_fkey";

-- AlterTable
ALTER TABLE "Busito" ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "plateNumber" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "year" INTEGER;

-- AddForeignKey
ALTER TABLE "Busito" ADD CONSTRAINT "Busito_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
