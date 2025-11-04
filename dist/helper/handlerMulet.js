"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const handlerMuler = (error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        console.error("Multer Error:", error);
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                error: "File terlalu besar",
                message: "Ukuran file maksimal 10MB",
            });
        }
        return res.status(400).json({
            success: false,
            error: "Error upload file",
            message: error.message,
        });
    }
    res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
    });
};
exports.default = handlerMuler;
//# sourceMappingURL=handlerMulet.js.map