import type { Peserta } from "../types/peserta.types";
export declare class PesertaService {
    /**
     * Create new peserta
     */
    static createPeserta(peserta: Peserta): Promise<Peserta>;
    /**
     * Get all peserta sorted by tanggal lahir (ascending)
     * Returns data dengan format untuk spreadsheet
     */
    static getAllPesertaSorted(): Promise<{
        id: string;
        fullName: string;
        asalSekolah: string;
        tglLahir: Date;
        usia: string;
        bulan: string;
        tanggal: string;
    }[]>;
    /**
     * Get peserta grouped by month
     * Berguna untuk membuat spreadsheet dengan sheet terpisah per bulan
     */
    static getPesertaGroupedByMonth(): Promise<Record<string, {
        id: string;
        fullName: string;
        asalSekolah: string;
        tglLahir: Date;
        usia: string;
        bulan: string;
        tanggal: string;
    }[]>>;
    /**
     * Get peserta by specific month and year
     */
    static getPesertaByMonth(month: number, year: number): Promise<{
        id: string;
        fullName: string;
        asalSekolah: string;
        tglLahir: Date;
        bulan: string;
        tanggal: string;
    }[]>;
    /**
     * Get peserta by date range
     */
    static getPesertaByDateRange(startDate: Date, endDate: Date): Promise<{
        id: string;
        fullName: string;
        asalSekolah: string;
        tglLahir: Date;
        bulan: string;
        tanggal: string;
    }[]>;
    /**
     * Get total count peserta
     */
    static getTotalPeserta(): Promise<number>;
    /**
     * Get peserta by asal sekolah
     */
    static getPesertaBySekolah(asalSekolah: string): Promise<{
        id: string;
        fullName: string;
        asalSekolah: string;
        tglLahir: Date;
        bulan: string;
        tanggal: string;
    }[]>;
    /**
     * Get single peserta by ID
     */
    static getPesertaById(id: string): Promise<{
        id: string;
        fullName: string;
        asalSekolah: string;
        tglLahir: Date;
        bulan: string;
        tanggal: string;
    }>;
    /**
     * Update peserta
     */
    static updatePeserta(id: string): Promise<{
        id: string;
        fullName: string;
        asalSekolah: string;
        tglLahir: Date;
        usia: string;
    }>;
    /**
     * Delete peserta
     */
    static deletePeserta(id: string): Promise<{
        message: string;
    }>;
    static deleteAllPeserta(): Promise<{
        message: string;
    }>;
    static deletePesertaByMonth(month: number): Promise<{
        message: string;
        deletedCount: number;
    }>;
}
//# sourceMappingURL=pesertaService.d.ts.map