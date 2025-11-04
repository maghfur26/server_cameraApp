"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadController_1 = require("../controllers/uploadController");
const multerConfig_1 = __importDefault(require("../config/multerConfig"));
const uploadRouter = (0, express_1.Router)();
uploadRouter.post("/upload", multerConfig_1.default.single("photo"), async (req, res) => {
    try {
        await (0, uploadController_1.uploadPeserta)(req, res);
    }
    catch (error) {
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
exports.default = uploadRouter;
//# sourceMappingURL=uploadRoutes.js.map