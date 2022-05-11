-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "underReview" SET DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isEditorial" BOOLEAN NOT NULL DEFAULT false;
