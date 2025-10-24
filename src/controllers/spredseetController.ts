// src/controllers/spreadsheetController.ts
import { Request, Response } from "express";
import { PesertaService } from "../services/pesertaService";
import {
  createPesertaSpreadsheet,
  createPesertaSpreadsheetByMonth,
  exportSpreadsheetAsExcel,
  exportSpreadsheetAsPDF,
} from "../helper/googleSheets";

export class SpreadsheetController {
  /**
   * GET /api/spreadsheet/peserta
   * Preview data peserta yang akan diexport
   * Query: ?groupByMonth=true (optional)
   */
  static async getPesertaData(req: Request, res: Response) {
    try {
      const { groupByMonth } = req.query;

      if (groupByMonth === "true") {
        const grouped = await PesertaService.getPesertaGroupedByMonth();
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

      const pesertaData = await PesertaService.getAllPesertaSorted();

      res.status(200).json({
        success: true,
        message: "Data peserta berhasil diambil",
        data: pesertaData,
        count: pesertaData.length,
      });
    } catch (error: any) {
      console.error("❌ Error getting peserta data:", error);
      res.status(500).json({
        success: false,
        error: "Gagal mengambil data peserta",
        message: error.message,
      });
    }
  }

  /**
   * POST /api/spreadsheet/create
   * Buat spreadsheet baru dengan semua data peserta (single sheet)
   * Body: { title?: string }
   */
  static async createSpreadsheet(req: Request, res: Response) {
    try {
      const { title = "Data Peserta" } = req.body;

      // Get sorted data
      const pesertaData = await PesertaService.getAllPesertaSorted();

      if (pesertaData.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Tidak ada data peserta untuk diexport",
        });
      }

      // Create spreadsheet
      const result = await createPesertaSpreadsheet(title, pesertaData);

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
    } catch (error: any) {
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
  static async createSpreadsheetByMonth(req: Request, res: Response) {
    try {
      const { title = "Data Peserta Per Bulan" } = req.body;

      // Get sorted data
      const pesertaData = await PesertaService.getAllPesertaSorted();

      if (pesertaData.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Tidak ada data peserta untuk diexport",
        });
      }

      // Create spreadsheet by month
      const result = await createPesertaSpreadsheetByMonth(title, pesertaData);

      // Get grouped data for summary
      const grouped = await PesertaService.getPesertaGroupedByMonth();
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
    } catch (error: any) {
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
  static async downloadExcel(req: Request, res: Response) {
    try {
      const { spreadsheetId } = req.params;

      if (!spreadsheetId) {
        return res.status(400).json({
          success: false,
          message: "Spreadsheet ID wajib diisi",
        });
      }

      const buffer = await exportSpreadsheetAsExcel(spreadsheetId);

      // Set headers for download
      const filename = `data-peserta-${Date.now()}.xlsx`;
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Length", buffer.length);

      res.send(buffer);
    } catch (error: any) {
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
  static async downloadPDF(req: Request, res: Response) {
    try {
      const { spreadsheetId } = req.params;

      if (!spreadsheetId) {
        return res.status(400).json({
          success: false,
          message: "Spreadsheet ID wajib diisi",
        });
      }

      const buffer = await exportSpreadsheetAsPDF(spreadsheetId);

      // Set headers for download
      const filename = `data-peserta-${Date.now()}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Length", buffer.length);

      res.send(buffer);
    } catch (error: any) {
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
  static async createAndDownloadExcel(req: Request, res: Response) {
    try {
      const {
        title = "Data Peserta",
        groupByMonth = false,
        month, // Parameter baru untuk filter bulan
      } = req.body;

      let pesertaData;

      // Jika ada filter bulan spesifik
      if (month && month !== "semua") {
        const grouped = await PesertaService.getPesertaGroupedByMonth();
        pesertaData = grouped[month] || [];

        if (pesertaData.length === 0) {
          return res.status(404).json({
            success: false,
            message: `Tidak ada data peserta untuk bulan ${month}`,
          });
        }
      } else {
        // Get all data
        pesertaData = await PesertaService.getAllPesertaSorted();
      }

      if (pesertaData.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Tidak ada data peserta untuk diexport",
        });
      }

      // Update title jika ada filter bulan
      const finalTitle =
        month && month !== "semua" ? `${title} - ${month}` : title;

      // Create spreadsheet
      // Jika filter bulan spesifik, gunakan single sheet
      // Jika "semua" atau groupByMonth true, gunakan multiple sheets
      const shouldGroupByMonth = (month === "semua" || !month) && groupByMonth;

      const result = shouldGroupByMonth
        ? await createPesertaSpreadsheetByMonth(finalTitle, pesertaData)
        : await createPesertaSpreadsheet(finalTitle, pesertaData);

      // Export to Excel
      const buffer = await exportSpreadsheetAsExcel(result.spreadsheetId);

      // Set headers for download
      const monthLabel = month && month !== "semua" ? month : "all";
      const filename = `data-peserta-${monthLabel}-${Date.now()}.xlsx`;

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Length", buffer.length);

      res.send(buffer);
    } catch (error: any) {
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
  static async createAndDownloadPDF(req: Request, res: Response) {
    try {
      const {
        title = "Data Peserta",
        groupByMonth = false,
        month, // Parameter baru untuk filter bulan
      } = req.body;

      let pesertaData;

      // Jika ada filter bulan spesifik
      if (month && month !== "semua") {
        const grouped = await PesertaService.getPesertaGroupedByMonth();
        pesertaData = grouped[month] || [];

        if (pesertaData.length === 0) {
          return res.status(404).json({
            success: false,
            message: `Tidak ada data peserta untuk bulan ${month}`,
          });
        }
      } else {
        // Get all data
        pesertaData = await PesertaService.getAllPesertaSorted();
      }

      if (pesertaData.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Tidak ada data peserta untuk diexport",
        });
      }

      // Update title jika ada filter bulan
      const finalTitle =
        month && month !== "semua" ? `${title} - ${month}` : title;

      // Create spreadsheet
      const shouldGroupByMonth = (month === "semua" || !month) && groupByMonth;

      const result = shouldGroupByMonth
        ? await createPesertaSpreadsheetByMonth(finalTitle, pesertaData)
        : await createPesertaSpreadsheet(finalTitle, pesertaData);

      // Export to PDF
      const buffer = await exportSpreadsheetAsPDF(result.spreadsheetId);

      // Set headers for download
      const monthLabel = month && month !== "semua" ? month : "all";
      const filename = `data-peserta-${monthLabel}-${Date.now()}.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Length", buffer.length);

      res.send(buffer);
    } catch (error: any) {
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
  static async deleteSpreadsheet(req: Request, res: Response) {
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
    } catch (error: any) {
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
  static async getSummary(req: Request, res: Response) {
    try {
      const pesertaData = await PesertaService.getAllPesertaSorted();
      const grouped = await PesertaService.getPesertaGroupedByMonth();

      const summary = Object.entries(grouped).map(([bulan, data]) => ({
        bulan,
        jumlah: data.length,
      }));

      // Get asal sekolah statistics
      const sekolahStats = pesertaData.reduce((acc, p) => {
        acc[p.asalSekolah] = (acc[p.asalSekolah] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

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
    } catch (error: any) {
      console.error("❌ Error getting summary:", error);
      res.status(500).json({
        success: false,
        error: "Gagal mengambil summary",
        message: error.message,
      });
    }
  }
}
