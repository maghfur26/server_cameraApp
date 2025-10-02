import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JWTPayload } from "../types/auth.types";
import prisma from "../config/dbconfig";

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

  static async verifyRefreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Get refresh token from body or cookie
      const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: "Refresh token is required",
        });
        return;
      }

      // Verify token
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET || "refresh-secret"
      ) as jwt.JwtPayload;

      // Find user with this refresh token
      const user = await prisma.user.findFirst({
        where: {
          id: decoded.id,
          refreshToken: refreshToken,
        },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
        return;
      }

      // Attach user to request
      req.user = {
        id: user.id,
        email: user.email,
        userName: user.userName,
        role: user.role,
      };

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          message: "Refresh token expired",
        });
        return;
      }

      res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }
  }
}
