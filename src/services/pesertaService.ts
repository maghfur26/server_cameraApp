// src/services/pesertaService.ts
import prisma from "../config/dbconfig";
import type { Peserta } from "../types/peserta.types";

export class PesertaService {
  /**
   * Create new peserta
   */
  static async createPeserta(peserta: Peserta): Promise<Peserta> {
    const newPeserta = await prisma.peserta.create({
      data: {
        fullName: peserta.fullName,
        asalSekolah: peserta.asalSekolah,
        tglLahir: peserta.tglLahir,
        usia: peserta.usia,
      },
    });

    return newPeserta;
  }

  /**
   * Get all peserta sorted by tanggal lahir (ascending)
   * Returns data dengan format untuk spreadsheet
   */
  static async getAllPesertaSorted() {
    const peserta = await prisma.peserta.findMany({
      orderBy: [
        {
          tglLahir: "asc",
        },
      ],
    });

    // Transform data untuk include bulan dan tanggal
    return peserta.map((peserta) => {
      const date = new Date(peserta.tglLahir);
      const bulan = date.toLocaleString("id-ID", { month: "long" });
      const tanggal = date.getDate().toString().padStart(2, "0");

      return {
        id: peserta.id,
        fullName: peserta.fullName,
        asalSekolah: peserta.asalSekolah,
        tglLahir: peserta.tglLahir,
        usia: peserta.usia,
        bulan,
        tanggal,
      };
    });
  }

  /**
   * Get peserta grouped by month
   * Berguna untuk membuat spreadsheet dengan sheet terpisah per bulan
   */
  static async getPesertaGroupedByMonth() {
    const peserta = await this.getAllPesertaSorted();

    // Group by month
    const grouped = peserta.reduce((acc, p) => {
      const bulan = p.bulan;
      if (!acc[bulan]) {
        acc[bulan] = [];
      }
      acc[bulan].push(p);
      return acc;
    }, {} as Record<string, typeof peserta>);

    return grouped;
  }

  /**
   * Get peserta by specific month and year
   */
  static async getPesertaByMonth(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const peserta = await prisma.peserta.findMany({
      where: {
        tglLahir: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        tglLahir: "asc",
      },
    });

    return peserta.map((p) => {
      const date = new Date(p.tglLahir);
      const bulan = date.toLocaleString("id-ID", { month: "long" });
      const tanggal = date.getDate().toString().padStart(2, "0");

      return {
        id: p.id,
        fullName: p.fullName,
        asalSekolah: p.asalSekolah,
        tglLahir: p.tglLahir,
        bulan,
        tanggal,
      };
    });
  }

  /**
   * Get peserta by date range
   */
  static async getPesertaByDateRange(startDate: Date, endDate: Date) {
    const peserta = await prisma.peserta.findMany({
      where: {
        tglLahir: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        tglLahir: "asc",
      },
    });

    return peserta.map((p) => {
      const date = new Date(p.tglLahir);
      const bulan = date.toLocaleString("id-ID", { month: "long" });
      const tanggal = date.getDate().toString().padStart(2, "0");

      return {
        id: p.id,
        fullName: p.fullName,
        asalSekolah: p.asalSekolah,
        tglLahir: p.tglLahir,
        bulan,
        tanggal,
      };
    });
  }

  /**
   * Get total count peserta
   */
  static async getTotalPeserta(): Promise<number> {
    return await prisma.peserta.count();
  }

  /**
   * Get peserta by asal sekolah
   */
  static async getPesertaBySekolah(asalSekolah: string) {
    const peserta = await prisma.peserta.findMany({
      where: {
        asalSekolah: {
          contains: asalSekolah,
          mode: "insensitive",
        },
      },
      orderBy: {
        tglLahir: "asc",
      },
    });

    return peserta.map((p) => {
      const date = new Date(p.tglLahir);
      const bulan = date.toLocaleString("id-ID", { month: "long" });
      const tanggal = date.getDate().toString().padStart(2, "0");

      return {
        id: p.id,
        fullName: p.fullName,
        asalSekolah: p.asalSekolah,
        tglLahir: p.tglLahir,
        bulan,
        tanggal,
      };
    });
  }

  /**
   * Get single peserta by ID
   */
  static async getPesertaById(id: string) {
    const peserta = await prisma.peserta.findUnique({
      where: { id },
    });

    if (!peserta) {
      throw new Error("PESERTA_NOT_FOUND");
    }

    const date = new Date(peserta.tglLahir);
    const bulan = date.toLocaleString("id-ID", { month: "long" });
    const tanggal = date.getDate().toString().padStart(2, "0");

    return {
      id: peserta.id,
      fullName: peserta.fullName,
      asalSekolah: peserta.asalSekolah,
      tglLahir: peserta.tglLahir,
      bulan,
      tanggal,
    };
  }

  /**
   * Update peserta
   */
  static async updatePeserta(id: string) {
    const existingPeserta = await prisma.peserta.findUnique({
      where: { id },
    });

    if (!existingPeserta) {
      throw new Error("PESERTA_NOT_FOUND");
    }

    const updatedPeserta = await prisma.peserta.update({
      where: { id },
      data: {
        fullName: existingPeserta.fullName,
        asalSekolah: existingPeserta.asalSekolah,
        tglLahir: existingPeserta.tglLahir,
      },
    });

    return updatedPeserta;
  }

  /**
   * Delete peserta
   */
  static async deletePeserta(id: string) {
    const existingPeserta = await prisma.peserta.findUnique({
      where: { id },
    });

    if (!existingPeserta) {
      throw new Error("PESERTA_NOT_FOUND");
    }

    await prisma.peserta.delete({
      where: { id },
    });

    return { message: "Peserta berhasil dihapus" };
  }

  static async deleteAllPeserta() {
    await prisma.peserta.deleteMany();

    return { message: "Semua peserta berhasil dihapus" };
  }

  static async deletePesertaByMonth(month: number) {
    if (month < 1 || month > 12) {
      throw new Error("Invalid month");
    }

    const result =
      await prisma.$executeRaw`DELETE FROM "Peserta" WHERE EXTRACT(MONTH FROM "tglLahir") = ${month}`;

    const bulanName = new Date(2025, month - 1, 1).toLocaleString("id-ID", {
      month: "long",
    });

    return {
      message: `Semua peserta bulan ${bulanName} berhasil dihapus`,
      deletedCount: result
    }
  }
}
