import fs from "fs";
import path from "path";
import process from "process";
import { authenticate } from "@google-cloud/local-auth";
import { google, drive_v3 } from "googleapis";
import { OAuth2Client } from "google-auth-library";

const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
const TOKEN_PATH = path.join(process.cwd(), "token.json");

const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  // atau gunakan ini jika hanya perlu akses terbatas:
  // "https://www.googleapis.com/auth/drive.file"
];

async function loadSavedCredentialsIfExist(): Promise<OAuth2Client | null> {
  try {
    const content = fs.readFileSync(TOKEN_PATH, "utf-8");
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials) as OAuth2Client;
  } catch {
    return null;
  }
}

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

async function getDriveService(): Promise<drive_v3.Drive> {
  const auth = await authorize();
  return google.drive({ version: "v3", auth });
}

export async function getOrCreateFolder(
  folderName: string,
  parentId?: string
): Promise<string> {
  const drive = await getDriveService();

  // Escape single quotes di nama folder untuk menghindari error query
  const escapedFolderName = folderName.replace(/'/g, "\\'");

  // Query untuk mencari folder
  const query = [
    `name='${escapedFolderName}'`,
    "mimeType='application/vnd.google-apps.folder'",
    "trashed=false",
  ];

  if (parentId) {
    query.push(`'${parentId}' in parents`);
  }

  console.log(`🔍 Mencari folder: ${folderName}`);
  console.log(`📋 Query: ${query.join(" and ")}`);

  try {
    const res = await drive.files.list({
      q: query.join(" and "),
      fields: "files(id, name, parents)",
      spaces: "drive",
      // ✅ Tambahkan ini untuk memastikan pencarian lebih akurat
      pageSize: 10,
    });

    // Cek apakah folder ditemukan
    if (res.data.files && res.data.files.length > 0) {
      const folder = res.data.files[0];
      if (!folder?.id) {
        throw new Error(`Folder ditemukan tapi tidak memiliki ID`);
      }
      console.log(`✅ Folder ditemukan: ${folder.name} (ID: ${folder.id})`);
      return folder.id;
    }

    // Jika tidak ditemukan, buat folder baru
    console.log(`📁 Folder "${folderName}" tidak ditemukan, membuat baru...`);

    const fileMetadata: drive_v3.Schema$File = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      ...(parentId && { parents: [parentId] }),
    };

    const folder = await drive.files.create({
      requestBody: fileMetadata,
      fields: "id, name",
    });

    console.log(
      `✅ Folder baru dibuat: ${folder.data.name} (ID: ${folder.data.id})`
    );
    return folder.data.id!;
  } catch (error: any) {
    console.error(
      `❌ Error saat mencari/membuat folder "${folderName}":`,
      error.message
    );
    throw error;
  }
}

// Upload file
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

  console.log("✅ File berhasil diupload:", res.data.name);
  return res.data;
}
