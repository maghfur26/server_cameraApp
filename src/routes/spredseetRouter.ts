// src/routes/spreadsheetRoutes.ts
import { Router } from "express";
import { AuthMiddleware } from "../middleware/auth";
import { SpreadsheetController } from "../controllers/spredseetController";

const spreadsheetRouter = Router();


spreadsheetRouter.use(AuthMiddleware.verifyToken);

// ==========================================
// PREVIEW & SUMMARY ROUTES
// ==========================================

/**
 * GET /api/spreadsheet/peserta
 * Preview data peserta yang akan diexport
 * Query params: ?groupByMonth=true (optional)
 *
 * Example:
 * GET /api/spreadsheet/peserta
 * GET /api/spreadsheet/peserta?groupByMonth=true
 */
spreadsheetRouter.get("/peserta", SpreadsheetController.getPesertaData);

/**
 * GET /api/spreadsheet/summary
 * Get summary statistik data peserta
 *
 * Example:
 * GET /api/spreadsheet/summary
 */
spreadsheetRouter.get("/summary", SpreadsheetController.getSummary);

// ==========================================
// CREATE SPREADSHEET ROUTES
// ==========================================

/**
 * POST /api/spreadsheet/create
 * Buat spreadsheet baru dengan semua data peserta (single sheet)
 * Body: { title?: string }
 *
 * Example:
 * POST /api/spreadsheet/create
 * Body: { "title": "Data Peserta 2024" }
 */
spreadsheetRouter.post("/create", SpreadsheetController.createSpreadsheet);

/**
 * POST /api/spreadsheet/create-by-month
 * Buat spreadsheet dengan sheet terpisah per bulan
 * Body: { title?: string }
 *
 * Example:
 * POST /api/spreadsheet/create-by-month
 * Body: { "title": "Data Peserta Per Bulan 2024" }
 */
spreadsheetRouter.post(
  "/create-by-month",
  SpreadsheetController.createSpreadsheetByMonth
);

// ==========================================
// DOWNLOAD ROUTES (dari spreadsheet yang sudah ada)
// ==========================================

/**
 * GET /api/spreadsheet/download/excel/:spreadsheetId
 * Download spreadsheet yang sudah ada sebagai Excel (.xlsx)
 *
 * Example:
 * GET /api/spreadsheet/download/excel/1ABC...xyz
 */
spreadsheetRouter.get(
  "/download/excel/:spreadsheetId",
  SpreadsheetController.downloadExcel
);

/**
 * GET /api/spreadsheet/download/pdf/:spreadsheetId
 * Download spreadsheet yang sudah ada sebagai PDF
 *
 * Example:
 * GET /api/spreadsheet/download/pdf/1ABC...xyz
 */
spreadsheetRouter.get(
  "/download/pdf/:spreadsheetId",
  SpreadsheetController.downloadPDF
);

// ==========================================
// EXPORT ROUTES (one-step: create + download)
// ==========================================

/**
 * POST /api/spreadsheet/export/excel
 * Buat spreadsheet dan langsung download sebagai Excel
 * Body: { title?: string, groupByMonth?: boolean }
 *
 * Example:
 * POST /api/spreadsheet/export/excel
 * Body: {
 *   "title": "Data Peserta",
 *   "groupByMonth": false
 * }
 */
spreadsheetRouter.post(
  "/export/excel",
  SpreadsheetController.createAndDownloadExcel
);

/**
 * POST /api/spreadsheet/export/pdf
 * Buat spreadsheet dan langsung download sebagai PDF
 * Body: { title?: string, groupByMonth?: boolean }
 *
 * Example:
 * POST /api/spreadsheet/export/pdf
 * Body: {
 *   "title": "Data Peserta",
 *   "groupByMonth": true
 * }
 */
spreadsheetRouter.post(
  "/export/pdf",
  SpreadsheetController.createAndDownloadPDF
);

// ==========================================
// MANAGEMENT ROUTES (optional)
// ==========================================

/**
 * DELETE /api/spreadsheet/:spreadsheetId
 * Hapus spreadsheet dari Google Drive
 * Note: Feature ini belum diimplementasikan
 *
 * Example:
 * DELETE /api/spreadsheet/1ABC...xyz
 */
spreadsheetRouter.delete(
  "/:spreadsheetId",
  SpreadsheetController.deleteSpreadsheet
);

export default spreadsheetRouter;
