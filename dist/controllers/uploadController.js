"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPeserta = uploadPeserta;
const path_1 = __importDefault(require("path"));
const googeDrive_1 = require("../helper/googeDrive");
const pesertaService_1 = require("../services/pesertaService");
const fs_1 = __importDefault(require("fs"));
// const ROOT_FOLDER = "19-EATxd3oIHvhDehcCZ1wAzKPVDBE9KD"; // ganti dengan folder root kamu
const ROOT_FOLDER = "1U7SmzuTJ5pl02oFOqo7D4EUYrkLFVpZJ";
async function uploadPeserta(req, res) {
    try {
        const photo = req.file;
        const { fullName, tglLahir, asalSekolah } = req.body;
        const birthDate = new Date(tglLahir);
        const today = new Date();
        // Hitung usia akurat
        let usia = today.getFullYear() - birthDate.getFullYear();
        if (today.getMonth() < birthDate.getMonth() ||
            (today.getMonth() === birthDate.getMonth() &&
                today.getDate() < birthDate.getDate())) {
            usia--;
        }
        if (!photo) {
            return res.status(400).json({ error: "File belum diupload" });
        }
        if (!tglLahir) {
            return res.status(400).json({ error: "Tanggal lahir wajib diisi" });
        }
        const date = new Date(tglLahir);
        const month = date.toLocaleString("id-ID", { month: "long" });
        const day = date.getDate().toString().padStart(2, "0");
        // 1. Buat folder bulan
        const monthFolderId = await (0, googeDrive_1.getOrCreateFolder)(month, ROOT_FOLDER);
        // 2. Buat folder tanggal
        const dayFolderId = await (0, googeDrive_1.getOrCreateFolder)(day, monthFolderId);
        // 3. Upload file
        const uploaded = await (0, googeDrive_1.uploadFile)(photo.path, `${fullName}-${asalSekolah}${path_1.default.extname(photo.originalname)}`, dayFolderId, photo.mimetype);
        // 4. Simpan data peserta ke database
        const peserta = {
            fullName,
            asalSekolah,
            tglLahir: birthDate,
            usia: usia.toString(),
        };
        await pesertaService_1.PesertaService.createPeserta(peserta);
        console.log("🌍 Link Drive:", uploaded.webViewLink);
        // Hapus file yang telah diupload
        fs_1.default.unlinkSync(photo.path);
        res.status(201).json({
            message: "Upload berhasil",
            folder_bulan: month,
            folder_id: dayFolderId,
            file: uploaded,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Upload gagal", details: error.message });
    }
}
//# sourceMappingURL=uploadController.js.map