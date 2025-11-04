"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpreadsheetController = void 0;
const pesertaService_1 = require("../services/pesertaService");
const googleSheets_1 = require("../helper/googleSheets");
class SpreadsheetController {
    /**
     * GET /api/spreadsheet/peserta
     * Preview data peserta yang akan diexport
     * Query: ?groupByMonth=true (optional)
     */
    static async getPesertaData(req, res) {
        try {
            const { groupByMonth } = req.query;
            if (groupByMonth === "true") {
                const grouped = await pesertaService_1.PesertaService.getPesertaGroupedByMonth();
                const summary = Object.entries(grouped).map(([bulan, data]) => ({
                    bulan,
                    jumlah: data.length,
                    peserta: data,
                }));
                return res.status(200).json({
                    success: true,
                    message: "Data peserta berhasil diambil (grouped by month)",
                    data: summary,
                    totalPeserta: summary.reduce((sum, item) => sum + item.jumlah, 0),
                });
            }
            const pesertaData = await pesertaService_1.PesertaService.getAllPesertaSorted();
            res.status(200).json({
                success: true,
                message: "Data peserta berhasil diambil",
                data: pesertaData,
                count: pesertaData.length,
            });
        }
        catch (error) {
            console.error("❌ Error getting peserta data:", error);
            res.status(500).json({
                success: false,
                error: "Gagal mengambil data peserta",
                message: error.message,
            });
        }
    }
    static async deletePeserta(req, res) {
    }
    /**
     * POST /api/spreadsheet/create
     * Buat spreadsheet baru dengan semua data peserta (single sheet)
     * Body: { title?: string }
     */
    static async createSpreadsheet(req, res) {
        try {
            const { title = "Data Peserta" } = req.body;
            // Get sorted data
            const pesertaData = await pesertaService_1.PesertaService.getAllPesertaSorted();
            if (pesertaData.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Tidak ada data peserta untuk diexport",
                });
            }
            // Create spreadsheet
            const result = await (0, googleSheets_1.createPesertaSpreadsheet)(title, pesertaData);
            res.status(200).json({
                success: true,
                message: "Spreadsheet berhasil dibuat",
                data: {
                    spreadsheetId: result.spreadsheetId,
                    spreadsheetUrl: result.spreadsheetUrl,
                    totalPeserta: pesertaData.length,
                    title,
                },
            });
        }
        catch (error) {
            console.error("❌ Error creating spreadsheet:", error);
            res.status(500).json({
                success: false,
                error: "Gagal membuat spreadsheet",
                message: error.message,
            });
        }
    }
    /**
     * POST /api/spreadsheet/create-by-month
     * Buat spreadsheet dengan sheet terpisah per bulan
     * Body: { title?: string }
     */
    static async createSpreadsheetByMonth(req, res) {
        try {
            const { title = "Data Peserta Per Bulan" } = req.body;
            // Get sorted data
            const pesertaData = await pesertaService_1.PesertaService.getAllPesertaSorted();
            if (pesertaData.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Tidak ada data peserta untuk diexport",
                });
            }
            // Create spreadsheet by month
            const result = await (0, googleSheets_1.createPesertaSpreadsheetByMonth)(title, pesertaData);
            // Get grouped data for summary
            const grouped = await pesertaService_1.PesertaService.getPesertaGroupedByMonth();
            const summary = Object.entries(grouped).map(([bulan, data]) => ({
                bulan,
                jumlah: data.length,
            }));
            res.status(200).json({
                success: true,
                message: "Spreadsheet per bulan berhasil dibuat",
                data: {
                    spreadsheetId: result.spreadsheetId,
                    spreadsheetUrl: result.spreadsheetUrl,
                    totalPeserta: pesertaData.length,
                    totalSheets: summary.length,
                    summary,
                    title,
                },
            });
        }
        catch (error) {
            console.error("❌ Error creating spreadsheet by month:", error);
            res.status(500).json({
                success: false,
                error: "Gagal membuat spreadsheet per bulan",
                message: error.message,
            });
        }
    }
    /**
     * GET /api/spreadsheet/download/excel/:spreadsheetId
     * Download spreadsheet yang sudah ada sebagai Excel
     */
    static async downloadExcel(req, res) {
        try {
            const { spreadsheetId } = req.params;
            if (!spreadsheetId) {
                return res.status(400).json({
                    success: false,
                    message: "Spreadsheet ID wajib diisi",
                });
            }
            const buffer = await (0, googleSheets_1.exportSpreadsheetAsExcel)(spreadsheetId);
            // Set headers for download
            const filename = `data-peserta-${Date.now()}.xlsx`;
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
            res.setHeader("Content-Length", buffer.length);
            res.send(buffer);
        }
        catch (error) {
            console.error("❌ Error downloading Excel:", error);
            // Check if headers already sent
            if (res.headersSent) {
                return;
            }
            res.status(500).json({
                success: false,
                error: "Gagal download Excel",
                message: error.message,
            });
        }
    }
    /**
     * GET /api/spreadsheet/download/pdf/:spreadsheetId
     * Download spreadsheet yang sudah ada sebagai PDF
     */
    static async downloadPDF(req, res) {
        try {
            const { spreadsheetId } = req.params;
            if (!spreadsheetId) {
                return res.status(400).json({
                    success: false,
                    message: "Spreadsheet ID wajib diisi",
                });
            }
            const buffer = await (0, googleSheets_1.exportSpreadsheetAsPDF)(spreadsheetId);
            // Set headers for download
            const filename = `data-peserta-${Date.now()}.pdf`;
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
            res.setHeader("Content-Length", buffer.length);
            res.send(buffer);
        }
        catch (error) {
            console.error("❌ Error downloading PDF:", error);
            // Check if headers already sent
            if (res.headersSent) {
                return;
            }
            res.status(500).json({
                success: false,
                error: "Gagal download PDF",
                message: error.message,
            });
        }
    }
    /**
     * POST /api/spreadsheet/export/excel
     * Buat spreadsheet dan langsung download sebagai Excel (one-step)
     * Body: { title?: string, groupByMonth?: boolean }
     */
    // Tambahkan method ini di SpreadsheetController
    /**
     * POST /api/spreadsheet/export/excel
     * Buat spreadsheet dan langsung download sebagai Excel (one-step)
     * Body: { title?: string, groupByMonth?: boolean, month?: string }
     */
    static async createAndDownloadExcel(req, res) {
        try {
            const { title = "Data Peserta", groupByMonth = false, month, // Parameter baru untuk filter bulan
             } = req.body;
            let pesertaData;
            // Jika ada filter bulan spesifik
            if (month && month !== "semua") {
                const grouped = await pesertaService_1.PesertaService.getPesertaGroupedByMonth();
                pesertaData = grouped[month] || [];
                if (pesertaData.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: `Tidak ada data peserta untuk bulan ${month}`,
                    });
                }
            }
            else {
                // Get all data
                pesertaData = await pesertaService_1.PesertaService.getAllPesertaSorted();
            }
            if (pesertaData.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Tidak ada data peserta untuk diexport",
                });
            }
            // Update title jika ada filter bulan
            const finalTitle = month && month !== "semua" ? `${title} - ${month}` : title;
            // Create spreadsheet
            // Jika filter bulan spesifik, gunakan single sheet
            // Jika "semua" atau groupByMonth true, gunakan multiple sheets
            const shouldGroupByMonth = (month === "semua" || !month) && groupByMonth;
            const result = shouldGroupByMonth
                ? await (0, googleSheets_1.createPesertaSpreadsheetByMonth)(finalTitle, pesertaData)
                : await (0, googleSheets_1.createPesertaSpreadsheet)(finalTitle, pesertaData);
            // Export to Excel
            const buffer = await (0, googleSheets_1.exportSpreadsheetAsExcel)(result.spreadsheetId);
            // Set headers for download
            const monthLabel = month && month !== "semua" ? month : "all";
            const filename = `data-peserta-${monthLabel}-${Date.now()}.xlsx`;
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
            res.setHeader("Content-Length", buffer.length);
            res.send(buffer);
        }
        catch (error) {
            console.error("❌ Error creating and downloading Excel:", error);
            if (res.headersSent) {
                return;
            }
            res.status(500).json({
                success: false,
                error: "Gagal membuat dan download Excel",
                message: error.message,
            });
        }
    }
    /**
     * POST /api/spreadsheet/export/pdf
     * Buat spreadsheet dan langsung download sebagai PDF (one-step)
     * Body: { title?: string, groupByMonth?: boolean, month?: string }
     */
    static async createAndDownloadPDF(req, res) {
        try {
            const { title = "Data Peserta", groupByMonth = false, month, // Parameter baru untuk filter bulan
             } = req.body;
            let pesertaData;
            // Jika ada filter bulan spesifik
            if (month && month !== "semua") {
                const grouped = await pesertaService_1.PesertaService.getPesertaGroupedByMonth();
                pesertaData = grouped[month] || [];
                if (pesertaData.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: `Tidak ada data peserta untuk bulan ${month}`,
                    });
                }
            }
            else {
                // Get all data
                pesertaData = await pesertaService_1.PesertaService.getAllPesertaSorted();
            }
            if (pesertaData.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Tidak ada data peserta untuk diexport",
                });
            }
            // Update title jika ada filter bulan
            const finalTitle = month && month !== "semua" ? `${title} - ${month}` : title;
            // Create spreadsheet
            const shouldGroupByMonth = (month === "semua" || !month) && groupByMonth;
            const result = shouldGroupByMonth
                ? await (0, googleSheets_1.createPesertaSpreadsheetByMonth)(finalTitle, pesertaData)
                : await (0, googleSheets_1.createPesertaSpreadsheet)(finalTitle, pesertaData);
            // Export to PDF
            const buffer = await (0, googleSheets_1.exportSpreadsheetAsPDF)(result.spreadsheetId);
            // Set headers for download
            const monthLabel = month && month !== "semua" ? month : "all";
            const filename = `data-peserta-${monthLabel}-${Date.now()}.pdf`;
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
            res.setHeader("Content-Length", buffer.length);
            res.send(buffer);
        }
        catch (error) {
            console.error("❌ Error creating and downloading PDF:", error);
            if (res.headersSent) {
                return;
            }
            res.status(500).json({
                success: false,
                error: "Gagal membuat dan download PDF",
                message: error.message,
            });
        }
    }
    /**
     * DELETE /api/spreadsheet/:spreadsheetId
     * Hapus spreadsheet dari Google Drive (optional feature)
     */
    static async deleteSpreadsheet(req, res) {
        try {
            const { spreadsheetId } = req.params;
            if (!spreadsheetId) {
                return res.status(400).json({
                    success: false,
                    message: "Spreadsheet ID wajib diisi",
                });
            }
            // Note: Anda perlu menambahkan fungsi deleteSpreadsheet di helper
            // Untuk sementara, return not implemented
            return res.status(501).json({
                success: false,
                message: "Feature delete spreadsheet belum diimplementasikan",
            });
        }
        catch (error) {
            console.error("❌ Error deleting spreadsheet:", error);
            res.status(500).json({
                success: false,
                error: "Gagal menghapus spreadsheet",
                message: error.message,
            });
        }
    }
    /**
     * GET /api/spreadsheet/summary
     * Get summary statistik data peserta
     */
    static async getSummary(req, res) {
        try {
            const pesertaData = await pesertaService_1.PesertaService.getAllPesertaSorted();
            const grouped = await pesertaService_1.PesertaService.getPesertaGroupedByMonth();
            const summary = Object.entries(grouped).map(([bulan, data]) => ({
                bulan,
                jumlah: data.length,
            }));
            // Get asal sekolah statistics
            const sekolahStats = pesertaData.reduce((acc, p) => {
                acc[p.asalSekolah] = (acc[p.asalSekolah] || 0) + 1;
                return acc;
            }, {});
            const topSekolah = Object.entries(sekolahStats)
                .map(([sekolah, jumlah]) => ({ sekolah, jumlah }))
                .sort((a, b) => b.jumlah - a.jumlah)
                .slice(0, 5);
            res.status(200).json({
                success: true,
                message: "Summary data berhasil diambil",
                data: {
                    totalPeserta: pesertaData.length,
                    totalBulan: summary.length,
                    perBulan: summary,
                    topSekolah,
                },
            });
        }
        catch (error) {
            console.error("❌ Error getting summary:", error);
            res.status(500).json({
                success: false,
                error: "Gagal mengambil summary",
                message: error.message,
            });
        }
    }
}
exports.SpreadsheetController = SpreadsheetController;
//# sourceMappingURL=spredseetController.js.map