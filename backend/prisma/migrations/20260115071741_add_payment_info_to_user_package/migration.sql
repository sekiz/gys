-- AlterTable
ALTER TABLE "user_packages" ADD COLUMN     "paymentAmount" DECIMAL(10,2),
ADD COLUMN     "paymentDate" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentNotes" TEXT,
ADD COLUMN     "transactionId" TEXT;
