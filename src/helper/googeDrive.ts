import fs from "fs";
import path from "path";
import process from "process";
import { authenticate } from "@google-cloud/local-auth";
import { google, drive_v3 } from "googleapis";
import { OAuth2Client } from "google-auth-library";

const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

// Load token lama kalau ada
async function loadSavedCredentialsIfExist(): Promise<OAuth2Client | null> {
  try {
    const content = fs.readFileSync(TOKEN_PATH, "utf-8");
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials) as OAuth2Client;
  } catch {
    return null;
  }
}

// Simpan token baru
async function saveCredentials(client: OAuth2Client): Promise<void> {
  const content = fs.readFileSync(CREDENTIALS_PATH, "utf-8");
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = {
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  };
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(payload, null, 2));
}

// OAuth2
async function authorize(): Promise<OAuth2Client> {
  let client = await loadSavedCredentialsIfExist();
  if (client) return client;

  client = (await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  })) as unknown as OAuth2Client;

  if (client.credentials) await saveCredentials(client);
  return client;
}

// Service Drive
async function getDriveService(): Promise<drive_v3.Drive> {
  const auth = await authorize();
  return google.drive({ version: "v3", auth });
}

// cari atau buat folder baru
export async function getOrCreateFolder(
  folderName: string,
  parentId?: string
): Promise<string> {
  const drive = await getDriveService();

  const query = [
    `name='${folderName}'`,
    "mimeType='application/vnd.google-apps.folder'",
    "trashed=false",
  ];
  if (parentId) query.push(`'${parentId}' in parents`);

  const res = await drive.files.list({
    q: query.join(" and "),
    fields: "files(id, name)",
    spaces: "drive",
  });

  if (res.data.files && res.data.files.length > 0 && res.data.files[0]?.id) {
    console.log(`✅ Folder ditemukan: ${res.data.files[0]?.id}`);
    return res.data.files[0]?.id!;
  }

  const fileMetadata: drive_v3.Schema$File = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
    parents: parentId ? [parentId] : null,
  };

  const folder = await drive.files.create({
    requestBody: fileMetadata,
    fields: "id",
  });

  console.log(`📁 Folder baru dibuat: ${folder.data.id}`);
  return folder.data.id!;
}

// ⬆Upload file
export async function uploadFile(
  filePath: string,
  fileName: string,
  folderId: string,
  mimeType: string
): Promise<drive_v3.Schema$File> {
  const drive = await getDriveService();

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };

  const media = {
    mimeType: mimeType,
    body: fs.createReadStream(filePath),
  };

  const res = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id, name, webViewLink, webContentLink",
  });

  console.log("File berhasil diupload:", res.data);
  return res.data;
}
