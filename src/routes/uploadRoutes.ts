import { Router } from "express";
import { uploadPeserta } from "../controllers/uploadController";
import upload from "../config/multerConfig";

const uploadRouter = Router();

uploadRouter.post("/upload", upload.single("photo"), async (req, res) => {
  console.log("\n🔥 =================================");
  console.log("🔥 REQUEST MASUK KE /api/upload");
  console.log("🔥 =================================");
  console.log("📨 Method:", req.method);
  console.log("📨 Headers:", req.headers["content-type"]);
  console.log("📨 Body:", req.body);
  console.log("📨 File:", req.file ? req.file.originalname : "TIDAK ADA");

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
