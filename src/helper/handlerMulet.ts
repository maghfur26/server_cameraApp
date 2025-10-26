import express from "express";
import multer from "multer";

const handlerMuler = (
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
};

export default handlerMuler;