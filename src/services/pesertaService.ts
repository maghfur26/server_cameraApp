import prisma from "../config/dbconfig";
import type { Peserta } from "../types/peserta.types";

export class PesertaService {
  static async createPeserta(peserta: Peserta): Promise<Peserta> {
    const newPeserta = await prisma.peserta.create({
      data: {
        fullName: peserta.fullName,
        asalSekolah: peserta.asalSekolah,
        tglLahir: peserta.tglLahir,
      },
    });

    return newPeserta;
  }
}
