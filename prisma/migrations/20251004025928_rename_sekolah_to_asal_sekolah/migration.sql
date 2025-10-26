/*
  Warnings:

  - You are about to drop the column `sekolah` on the `Peserta` table. All the data in the column will be lost.
  - Added the required column `asalSekolah` to the `Peserta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Peserta" DROP COLUMN "sekolah",
ADD COLUMN     "asalSekolah" TEXT NOT NULL;
