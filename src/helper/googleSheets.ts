// src/helper/googleSheets.ts
import { google, sheets_v4 } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import fs from "fs";
import path from "path";
import process from "process";

const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/spreadsheets",
];

// Load saved credentials
async function loadSavedCredentialsIfExist(): Promise<OAuth2Client | null> {
  try {
    const content = fs.readFileSync(TOKEN_PATH, "utf-8");
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials) as OAuth2Client;
  } catch {
    return null;
  }
}

// Authorize and get OAuth2 client
async function authorize(): Promise<OAuth2Client> {
  let client = await loadSavedCredentialsIfExist();
  if (client) return client;
  throw new Error("Token not found. Please run createTokenJson.ts first");
}

// Get Sheets service
async function getSheetsService(): Promise<sheets_v4.Sheets> {
  const auth = await authorize();
  return google.sheets({ version: "v4", auth });
}

// Interface untuk data peserta
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
export async function createPesertaSpreadsheet(
  title: string,
  data: PesertaData[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const sheets = await getSheetsService();

  // Buat spreadsheet baru
  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: title,
      },
      sheets: [
        {
          properties: {
            title: "Data Peserta",
            gridProperties: {
              frozenRowCount: 1, // Freeze header row
            },
          },
        },
      ],
    },
  });

  const spreadsheetId = spreadsheet.data.spreadsheetId;
  const spreadsheetUrl = spreadsheet.data.spreadsheetUrl;

  if (!spreadsheetId || !spreadsheetUrl) {
    throw new Error("Gagal membuat spreadsheet: ID atau URL tidak ada");
  }

  // ✅ FIX: Get the actual sheetId from created spreadsheet
  const firstSheet = spreadsheet.data.sheets?.[0];
  const sheetId = firstSheet?.properties?.sheetId;

  if (sheetId === undefined) {
    throw new Error("Gagal mendapatkan sheet ID dari spreadsheet");
  }

  console.log(`📋 Sheet ID: ${sheetId}`);

  // Siapkan data untuk spreadsheet
  const values: any[][] = [
    ["No", "Nama Lengkap", "Asal Sekolah", "Tanggal Lahir", "Bulan", "Usia"],
  ];

  // Tambahkan data peserta
  data.forEach((peserta, index) => {
    values.push([
      index + 1,
      peserta.fullName,
      peserta.asalSekolah,
      new Date(peserta.tglLahir).toLocaleDateString("id-ID"),
      peserta.bulan,
      peserta.usia,
    ]);
  });

  // Update spreadsheet dengan data
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Data Peserta!A1",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values,
    },
  });

  // ✅ FIX: Format header dengan sheetId yang benar
  const formatRequests: sheets_v4.Schema$Request[] = [
    {
      repeatCell: {
        range: {
          sheetId: sheetId, // ✅ Changed from 0 to actual sheetId
          startRowIndex: 0,
          endRowIndex: 1,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: {
              red: 0.2,
              green: 0.6,
              blue: 0.86,
            },
            textFormat: {
              bold: true,
              foregroundColor: {
                red: 1,
                green: 1,
                blue: 1,
              },
            },
            horizontalAlignment: "CENTER",
          },
        },
        fields:
          "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
      },
    },
    {
      autoResizeDimensions: {
        dimensions: {
          sheetId: sheetId, // ✅ Changed from 0 to actual sheetId
          dimension: "COLUMNS",
          startIndex: 0,
          endIndex: 6,
        },
      },
    },
  ];

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: formatRequests,
    },
  });

  console.log(`✅ Spreadsheet created: ${spreadsheetUrl}`);
  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Membuat spreadsheet yang dikelompokkan per bulan
 * @param title - Judul spreadsheet
 * @param data - Array data peserta
 * @returns Spreadsheet ID dan URL
 */
export async function createPesertaSpreadsheetByMonth(
  title: string,
  data: PesertaData[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const sheets = await getSheetsService();

  // Group data by month
  const dataByMonth = data.reduce((acc, peserta) => {
    const bulan = peserta.bulan;
    if (!acc[bulan]) {
      acc[bulan] = [];
    }
    acc[bulan].push(peserta);
    return acc;
  }, {} as Record<string, PesertaData[]>);

  // Buat spreadsheet dengan sheet untuk setiap bulan
  const sheetRequests = Object.keys(dataByMonth).map((bulan) => ({
    properties: {
      title: bulan,
      gridProperties: {
        frozenRowCount: 1,
      },
    },
  }));

  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: title,
      },
      sheets: sheetRequests,
    },
  });

  const spreadsheetId = spreadsheet.data.spreadsheetId;
  const spreadsheetUrl = spreadsheet.data.spreadsheetUrl;

  if (!spreadsheetId || !spreadsheetUrl) {
    throw new Error("Gagal membuat spreadsheet: ID atau URL tidak ada");
  }

  // ✅ FIX: Get sheet IDs and names from created spreadsheet
  const sheetsMap = new Map<string, number>();
  spreadsheet.data.sheets?.forEach((sheet) => {
    const sheetName = sheet.properties?.title;
    const sheetId = sheet.properties?.sheetId;
    if (sheetName && sheetId !== null && sheetId !== undefined) {
      sheetsMap.set(sheetName, sheetId);
      console.log(`📋 Sheet: ${sheetName} (ID: ${sheetId})`);
    }
  });

  // Populate each sheet
  for (const [bulan, pesertaList] of Object.entries(dataByMonth)) {
    const values: any[][] = [
      ["No", "Nama Lengkap", "Asal Sekolah", "Tanggal Lahir", "Usia"],
    ];

    pesertaList.forEach((peserta, index) => {
      values.push([
        index + 1,
        peserta.fullName,
        peserta.asalSekolah,
        new Date(peserta.tglLahir).toLocaleDateString("id-ID"),
        peserta.usia,
      ]);
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${bulan}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });
  }

  // ✅ FIX: Format all sheets using actual sheet IDs
  const formatRequests: sheets_v4.Schema$Request[] = [];

  sheetsMap.forEach((sheetId, sheetName) => {
    formatRequests.push(
      {
        repeatCell: {
          range: {
            sheetId: sheetId, // ✅ Using actual sheet ID from map
            startRowIndex: 0,
            endRowIndex: 1,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: {
                red: 0.2,
                green: 0.6,
                blue: 0.86,
              },
              textFormat: {
                bold: true,
                foregroundColor: {
                  red: 1,
                  green: 1,
                  blue: 1,
                },
              },
              horizontalAlignment: "CENTER",
            },
          },
          fields:
            "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
        },
      },
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId: sheetId,
            dimension: "COLUMNS",
            startIndex: 0,
            endIndex: 5,
          },
        },
      }
    );
  });

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: formatRequests,
    },
  });

  console.log(`✅ Spreadsheet by month created: ${spreadsheetUrl}`);
  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Export spreadsheet sebagai Excel file
 * @param spreadsheetId - ID spreadsheet
 * @returns Buffer file Excel
 */
export async function exportSpreadsheetAsExcel(
  spreadsheetId: string
): Promise<Buffer> {
  const auth = await authorize();
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.export(
    {
      fileId: spreadsheetId,
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
    { responseType: "arraybuffer" }
  );

  return Buffer.from(response.data as ArrayBuffer);
}

/**
 * Export spreadsheet sebagai PDF
 * @param spreadsheetId - ID spreadsheet
 * @returns Buffer file PDF
 */
export async function exportSpreadsheetAsPDF(
  spreadsheetId: string
): Promise<Buffer> {
  const auth = await authorize();
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.export(
    {
      fileId: spreadsheetId,
      mimeType: "application/pdf",
    },
    { responseType: "arraybuffer" }
  );

  return Buffer.from(response.data as ArrayBuffer);
}
