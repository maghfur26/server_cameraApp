import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/dbconfig";
import type { JWTPayload } from "../types/auth.types";

export class AuthMiddleware {
  static async verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(401).json({
          success: false,
          message: "Access token required",
        });
      }

      const token = authHeader.substring(7); //remove bearer prefix
      const accessToken = process.env.ACCESS_TOKEN_SECRET;

      if (!accessToken) {
        throw new Error("Jwt secret not configured");
      }

      //   verify token
      const decoded = jwt.verify(token, accessToken) as JWTPayload;

      req.user = {
        id: decoded.id,
        userName: decoded.userName,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error) {
      console.error("Token verification error");

      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }

      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          success: false,
          message: "Token expired",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Authentication error",
      });
    }
  }

  static authorize(...allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: "Authentication required",
          });
        }

        if (!allowedRoles.includes(req.user.role)) {
          return res.status(403).json({
            success: false,
            message: `Access denied. Required roles: ${allowedRoles.join(
              ", "
            )}`,
          });
        }

        next();
      } catch (error) {
        console.error("Authorization error:", error);

        return res.status(500).json({
          success: false,
          message: "Authorization error",
        });
      }
    };
  }

  static adminOnly(req: Request, res: Response, next: NextFunction) {
    return AuthMiddleware.authorize("admin")(req, res, next);
  }

  static adminOrOwner(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const isAdmin = req.user.role === "admin";

      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin or resource owner required",
        });
      }

      next();
    } catch (error) {
      console.error("Authorization error:", error);
      return res.status(500).json({
        success: false,
        message: "Authorization error",
      });
    }
  }
}
