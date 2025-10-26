import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import spreadsheetRouter from "./routes/spredseetRouter";
import pesertaRouter from "./routes/pesertaRouter";
import handlerMuler from "./helper/handlerMulet";
import corsConfig from "./config/corsConfig";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(corsConfig);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", userRoutes);
app.use("/api", uploadRoutes);
app.use("/api", spreadsheetRouter);
app.use("/api", pesertaRouter);

// Error handler untuk multer
app.use(handlerMuler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
