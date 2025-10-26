/*
  Warnings:

  - You are about to drop the column `username` on the `Peserta` table. All the data in the column will be lost.
  - Added the required column `fullName` to the `Peserta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Peserta" DROP COLUMN "username",
ADD COLUMN     "fullName" TEXT NOT NULL;
