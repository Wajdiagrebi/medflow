/*
  Warnings:

  - You are about to drop the column `birthDate` on the `Patient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "birthDate",
ADD COLUMN     "age" INTEGER NOT NULL DEFAULT 0;
