interface PesertaData {
    fullName: string;
    asalSekolah: string;
    tglLahir: Date;
    bulan: string;
    tanggal: string;
    usia: string;
}
/**
 * Membuat Google Spreadsheet baru dengan data peserta
 * @param title - Judul spreadsheet
 * @param data - Array data peserta
 * @returns Spreadsheet ID dan URL
 */
export declare function createPesertaSpreadsheet(title: string, data: PesertaData[]): Promise<{
    spreadsheetId: string;
    spreadsheetUrl: string;
}>;
/**
 * Membuat spreadsheet yang dikelompokkan per bulan
 * @param title - Judul spreadsheet
 * @param data - Array data peserta
 * @returns Spreadsheet ID dan URL
 */
export declare function createPesertaSpreadsheetByMonth(title: string, data: PesertaData[]): Promise<{
    spreadsheetId: string;
    spreadsheetUrl: string;
}>;
/**
 * Export spreadsheet sebagai Excel file
 * @param spreadsheetId - ID spreadsheet
 * @returns Buffer file Excel
 */
export declare function exportSpreadsheetAsExcel(spreadsheetId: string): Promise<Buffer>;
/**
 * Export spreadsheet sebagai PDF
 * @param spreadsheetId - ID spreadsheet
 * @returns Buffer file PDF
 */
export declare function exportSpreadsheetAsPDF(spreadsheetId: string): Promise<Buffer>;
export {};
//# sourceMappingURL=googleSheets.d.ts.map