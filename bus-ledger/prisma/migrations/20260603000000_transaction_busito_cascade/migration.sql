-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_busitoId_fkey";

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_busitoId_fkey" FOREIGN KEY ("busitoId") REFERENCES "Busito"("id") ON DELETE CASCADE ON UPDATE CASCADE;
