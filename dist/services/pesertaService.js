"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PesertaService = void 0;
// src/services/pesertaService.ts
const dbconfig_1 = __importDefault(require("../config/dbconfig"));
class PesertaService {
    /**
     * Create new peserta
     */
    static async createPeserta(peserta) {
        const newPeserta = await dbconfig_1.default.peserta.create({
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
        const peserta = await dbconfig_1.default.peserta.findMany({
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
        }, {});
        return grouped;
    }
    /**
     * Get peserta by specific month and year
     */
    static async getPesertaByMonth(month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const peserta = await dbconfig_1.default.peserta.findMany({
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
    static async getPesertaByDateRange(startDate, endDate) {
        const peserta = await dbconfig_1.default.peserta.findMany({
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
    static async getTotalPeserta() {
        return await dbconfig_1.default.peserta.count();
    }
    /**
     * Get peserta by asal sekolah
     */
    static async getPesertaBySekolah(asalSekolah) {
        const peserta = await dbconfig_1.default.peserta.findMany({
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
    static async getPesertaById(id) {
        const peserta = await dbconfig_1.default.peserta.findUnique({
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
    static async updatePeserta(id) {
        const existingPeserta = await dbconfig_1.default.peserta.findUnique({
            where: { id },
        });
        if (!existingPeserta) {
            throw new Error("PESERTA_NOT_FOUND");
        }
        const updatedPeserta = await dbconfig_1.default.peserta.update({
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
    static async deletePeserta(id) {
        const existingPeserta = await dbconfig_1.default.peserta.findUnique({
            where: { id },
        });
        if (!existingPeserta) {
            throw new Error("PESERTA_NOT_FOUND");
        }
        await dbconfig_1.default.peserta.delete({
            where: { id },
        });
        return { message: "Peserta berhasil dihapus" };
    }
    static async deleteAllPeserta() {
        await dbconfig_1.default.peserta.deleteMany();
        return { message: "Semua peserta berhasil dihapus" };
    }
    static async deletePesertaByMonth(month) {
        if (month < 1 || month > 12) {
            throw new Error("Invalid month");
        }
        const result = await dbconfig_1.default.$executeRaw `DELETE FROM "Peserta" WHERE EXTRACT(MONTH FROM "tglLahir") = ${month}`;
        const bulanName = new Date(2025, month - 1, 1).toLocaleString("id-ID", {
            month: "long",
        });
        return {
            message: `Semua peserta bulan ${bulanName} berhasil dihapus`,
            deletedCount: result
        };
    }
}
exports.PesertaService = PesertaService;
//# sourceMappingURL=pesertaService.js.map