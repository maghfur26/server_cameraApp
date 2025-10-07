import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JWTPayload } from "../types/auth.types";
import prisma from "../config/dbconfig";

export class AuthMiddleware {
  /**
   * Verify Access Token
   */
  static async verifyToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          message: "Access token is required",
        });
        return;
      }

      const token = authHeader.substring(7);

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as JWTPayload;

      // Check if token exists in database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user || user.accessToken !== token) {
        res.status(401).json({
          success: false,
          message: "Invalid or expired access token",
        });
        return;
      }

      req.user = decoded;
      next();
    } catch (error) {
      console.error("Token verification error:", error);

      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          message: "Access token has expired",
          code: "TOKEN_EXPIRED",
        });
        return;
      }

      res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }
  }

  /**
   * Verify Refresh Token
   */
  static async verifyRefreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          message: "Refresh token is required",
        });
        return;
      }

      const token = authHeader.substring(7);

      // Verify refresh token
      const decoded = jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET!
      ) as JWTPayload;

      // Check if refresh token exists in database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user || user.refreshToken !== token) {
        res.status(401).json({
          success: false,
          message: "Invalid or expired refresh token",
        });
        return;
      }

      req.user = decoded;
      next();
    } catch (error) {
      console.error("Refresh token verification error:", error);

      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          message: "Refresh token has expired",
          code: "REFRESH_TOKEN_EXPIRED",
        });
        return;
      }

      res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }
  }

  /**
   * Admin Only Middleware
   */
  static adminOnly(req: Request, res: Response, next: NextFunction): void {
    if (req.user?.role !== "ADMIN") {
      res.status(403).json({
        success: false,
        message: "Admin access required",
      });
      return;
    }
    next();
  }
}
