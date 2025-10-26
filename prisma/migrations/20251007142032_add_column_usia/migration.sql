/*
  Warnings:

  - Added the required column `usia` to the `Peserta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Peserta" ADD COLUMN     "usia" TEXT NOT NULL;
