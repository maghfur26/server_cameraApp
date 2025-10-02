import { Request, Response } from "express";
import path from "path";
import { getOrCreateFolder, uploadFile } from "../helper/googeDrive";
import fs from "fs";

// const ROOT_FOLDER = "19-EATxd3oIHvhDehcCZ1wAzKPVDBE9KD"; // ganti dengan folder root kamu
const ROOT_FOLDER = "1U7SmzuTJ5pl02oFOqo7D4EUYrkLFVpZJ";

export async function uploadPeserta(req: Request, res: Response) {
  try {
    const photo = req.file;
    const { fullName, tglLahir, asalSekolah } = req.body;

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
    const monthFolderId = await getOrCreateFolder(month, ROOT_FOLDER);

    // 2. Buat folder tanggal
    const dayFolderId = await getOrCreateFolder(day, monthFolderId);

    // 3. Upload file
    const uploaded = await uploadFile(
      photo.path,
      `${fullName}-${asalSekolah}${path.extname(photo.originalname)}`,
      dayFolderId,
      photo.mimetype
    );

    console.log("🌍 Link Drive:", uploaded.webViewLink);

    // Hapus file yang telah diupload
    fs.unlinkSync(photo.path);

    res.json({
      message: "Upload berhasil",
      folder_bulan: month,
      folder_id: dayFolderId,
      file: uploaded,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Upload gagal", details: error.message });
  }
}
