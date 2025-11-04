import { Request, Response } from "express";
export declare class SpreadsheetController {
    /**
     * GET /api/spreadsheet/peserta
     * Preview data peserta yang akan diexport
     * Query: ?groupByMonth=true (optional)
     */
    static getPesertaData(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deletePeserta(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/spreadsheet/create
     * Buat spreadsheet baru dengan semua data peserta (single sheet)
     * Body: { title?: string }
     */
    static createSpreadsheet(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * POST /api/spreadsheet/create-by-month
     * Buat spreadsheet dengan sheet terpisah per bulan
     * Body: { title?: string }
     */
    static createSpreadsheetByMonth(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * GET /api/spreadsheet/download/excel/:spreadsheetId
     * Download spreadsheet yang sudah ada sebagai Excel
     */
    static downloadExcel(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * GET /api/spreadsheet/download/pdf/:spreadsheetId
     * Download spreadsheet yang sudah ada sebagai PDF
     */
    static downloadPDF(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * POST /api/spreadsheet/export/excel
     * Buat spreadsheet dan langsung download sebagai Excel (one-step)
     * Body: { title?: string, groupByMonth?: boolean }
     */
    /**
     * POST /api/spreadsheet/export/excel
     * Buat spreadsheet dan langsung download sebagai Excel (one-step)
     * Body: { title?: string, groupByMonth?: boolean, month?: string }
     */
    static createAndDownloadExcel(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * POST /api/spreadsheet/export/pdf
     * Buat spreadsheet dan langsung download sebagai PDF (one-step)
     * Body: { title?: string, groupByMonth?: boolean, month?: string }
     */
    static createAndDownloadPDF(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * DELETE /api/spreadsheet/:spreadsheetId
     * Hapus spreadsheet dari Google Drive (optional feature)
     */
    static deleteSpreadsheet(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * GET /api/spreadsheet/summary
     * Get summary statistik data peserta
     */
    static getSummary(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=spredseetController.d.ts.map