"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateFolder = getOrCreateFolder;
exports.uploadFile = uploadFile;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const process_1 = __importDefault(require("process"));
const local_auth_1 = require("@google-cloud/local-auth");
const googleapis_1 = require("googleapis");
const CREDENTIALS_PATH = path_1.default.join(process_1.default.cwd(), "credentials.json");
const TOKEN_PATH = path_1.default.join(process_1.default.cwd(), "token.json");
const SCOPES = [
    "https://www.googleapis.com/auth/drive",
    // atau gunakan ini jika hanya perlu akses terbatas:
    // "https://www.googleapis.com/auth/drive.file"
];
async function loadSavedCredentialsIfExist() {
    try {
        const content = fs_1.default.readFileSync(TOKEN_PATH, "utf-8");
        const credentials = JSON.parse(content);
        return googleapis_1.google.auth.fromJSON(credentials);
    }
    catch {
        return null;
    }
}
async function saveCredentials(client) {
    const content = fs_1.default.readFileSync(CREDENTIALS_PATH, "utf-8");
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = {
        type: "authorized_user",
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    };
    fs_1.default.writeFileSync(TOKEN_PATH, JSON.stringify(payload, null, 2));
}
async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client)
        return client;
    client = (await (0, local_auth_1.authenticate)({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    }));
    if (client.credentials)
        await saveCredentials(client);
    return client;
}
async function getDriveService() {
    const auth = await authorize();
    return googleapis_1.google.drive({ version: "v3", auth });
}
async function getOrCreateFolder(folderName, parentId) {
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
        const fileMetadata = {
            name: folderName,
            mimeType: "application/vnd.google-apps.folder",
            ...(parentId && { parents: [parentId] }),
        };
        const folder = await drive.files.create({
            requestBody: fileMetadata,
            fields: "id, name",
        });
        console.log(`✅ Folder baru dibuat: ${folder.data.name} (ID: ${folder.data.id})`);
        return folder.data.id;
    }
    catch (error) {
        console.error(`❌ Error saat mencari/membuat folder "${folderName}":`, error.message);
        throw error;
    }
}
// Upload file
async function uploadFile(filePath, fileName, folderId, mimeType) {
    const drive = await getDriveService();
    const fileMetadata = {
        name: fileName,
        parents: [folderId],
    };
    const media = {
        mimeType: mimeType,
        body: fs_1.default.createReadStream(filePath),
    };
    const res = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: "id, name, webViewLink, webContentLink",
    });
    console.log("✅ File berhasil diupload:", res.data.name);
    return res.data;
}
//# sourceMappingURL=googeDrive.js.map