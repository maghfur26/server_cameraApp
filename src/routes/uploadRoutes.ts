import { Router } from "express";
import { uploadPeserta } from "../controllers/uploadController";
import upload from "../config/multerConfig";

const uploadRouter = Router();

uploadRouter.post("/upload", upload.single("photo"), async (req, res) => {
  try {
    await uploadPeserta(req, res);
  } catch (error: any) {
    console.error("❌ Error di route handler:", error);

    // Hanya kirim response jika belum dikirim
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
      });
    }
  }
});

export default uploadRouter;
