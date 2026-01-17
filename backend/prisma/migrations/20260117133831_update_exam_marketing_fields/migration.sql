-- AlterTable
ALTER TABLE "exams" ADD COLUMN     "category" TEXT,
ADD COLUMN     "enrolledCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "institution" TEXT,
ADD COLUMN     "rating" DECIMAL(2,1) NOT NULL DEFAULT 4.8,
ADD COLUMN     "ratingCount" INTEGER NOT NULL DEFAULT 120;
