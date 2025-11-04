"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const isProduction = process.env.NODE_ENV === "production";
const origin = isProduction
    ? "https://dasboard-id-sync-cam.vercel.app"
    : "http://localhost:5173";
const corsConfig = (0, cors_1.default)({
    origin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
        "ngrok-skip-browser-warning"
    ],
    exposedHeaders: ["Content-disposition"], // for download file
});
exports.default = corsConfig;
//# sourceMappingURL=corsConfig.js.map