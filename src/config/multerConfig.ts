import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Generate nama file unik untuk menghindari konflik
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = file.fieldname + "-" + uniqueSuffix;
    console.log(`📝 Multer: File akan disimpan dengan nama: ${filename}`);
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log("🔍 Multer: Filtering file:", file.originalname, file.mimetype);
    // Filter hanya gambar
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      console.log("❌ File ditolak: bukan gambar");
      cb(new Error("Hanya file gambar yang diperbolehkan!"));
    }
  },
});

export default upload;
