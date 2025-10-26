/*
  Warnings:

  - You are about to drop the column `ttl` on the `Peserta` table. All the data in the column will be lost.
  - Added the required column `tglLahir` to the `Peserta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Peserta" DROP COLUMN "ttl",
ADD COLUMN     "tglLahir" TIMESTAMP(3) NOT NULL;
