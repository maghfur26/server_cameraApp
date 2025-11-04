"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
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
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        console.log("🔍 Multer: Filtering file:", file.originalname, file.mimetype);
        // Filter hanya gambar
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        }
        else {
            console.log("❌ File ditolak: bukan gambar");
            cb(new Error("Hanya file gambar yang diperbolehkan!"));
        }
    },
});
exports.default = upload;
//# sourceMappingURL=multerConfig.js.map