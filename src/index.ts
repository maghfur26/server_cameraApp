import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import spreadsheetRouter from "./routes/spredseetRouter";
import multer from "multer";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// ✅ Whitelist multiple origins
const allowedOrigins = [
  "http://localhost:5173", // Development
  "https://dasboard-id-sync-cam.vercel.app",
  "http://localhost:3000", // Alternative dev port
  "https://staging.yourdomain.com", // Staging
];

// ✅ Dynamic CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Content-disposition"],
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", userRoutes);
app.use("/api", uploadRoutes);
app.use("/api", spreadsheetRouter);

// Error handler untuk multer
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (error instanceof multer.MulterError) {
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
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
