import cors from "cors";

const isProduction = process.env.NODE_ENV === "production";

const origin = isProduction
  ? "https://dasboard-id-sync-cam.vercel.app"
  : "http://localhost:5173";

const corsConfig = cors({
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

export default corsConfig;
