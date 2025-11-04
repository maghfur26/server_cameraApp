"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dbconfig_1 = __importDefault(require("../config/dbconfig"));
class AuthMiddleware {
    /**
     * Verify Access Token - Support both Cookie (web) and Bearer (mobile)
     */
    static async verifyToken(req, res, next) {
        try {
            let token;
            // ✅ Priority 1: Check cookies (for web)
            if (req.cookies?.access_token) {
                token = req.cookies.access_token;
            }
            // ✅ Priority 2: Check Authorization header (for mobile)
            else if (req.headers.authorization?.startsWith("Bearer ")) {
                token = req.headers.authorization.substring(7);
            }
            if (!token) {
                res.status(401).json({
                    success: false,
                    message: "Access token is required",
                    code: "NO_TOKEN",
                });
                return;
            }
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
            // Check if user exists in database
            const user = await dbconfig_1.default.user.findUnique({
                where: { id: decoded.id },
            });
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: "User not found",
                    code: "USER_NOT_FOUND",
                });
                return;
            }
            req.user = decoded;
            next();
        }
        catch (error) {
            console.error("Token verification error:", error);
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                res.status(401).json({
                    success: false,
                    message: "Access token has expired",
                    code: "TOKEN_EXPIRED",
                });
                return;
            }
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                res.status(401).json({
                    success: false,
                    message: "Invalid token signature",
                    code: "INVALID_SIGNATURE",
                });
                return;
            }
            res.status(401).json({
                success: false,
                message: "Invalid access token",
                code: "INVALID_TOKEN",
            });
        }
    }
    /**
     * Verify Refresh Token - Support both Cookie (web) and Bearer (mobile)
     */
    static async verifyRefreshToken(req, res, next) {
        try {
            let token;
            // ✅ Priority 1: Check cookies (for web)
            if (req.cookies?.refresh_token) {
                token = req.cookies.refresh_token;
            }
            // ✅ Priority 2: Check Authorization header (for mobile)
            else if (req.headers.authorization?.startsWith("Bearer ")) {
                token = req.headers.authorization.substring(7);
            }
            if (!token) {
                res.status(401).json({
                    success: false,
                    message: "Refresh token is required",
                    code: "NO_REFRESH_TOKEN",
                });
                return;
            }
            // Verify refresh token
            const decoded = jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_SECRET);
            // Check if refresh token exists in database
            const user = await dbconfig_1.default.user.findUnique({
                where: { id: decoded.id },
            });
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: "User not found",
                    code: "USER_NOT_FOUND",
                });
                return;
            }
            if (!user.refreshToken || user.refreshToken !== token) {
                res.status(401).json({
                    success: false,
                    message: "Invalid or expired refresh token",
                    code: "INVALID_REFRESH_TOKEN",
                });
                return;
            }
            req.user = decoded;
            next();
        }
        catch (error) {
            console.error("Refresh token verification error:", error);
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                res.status(401).json({
                    success: false,
                    message: "Refresh token has expired",
                    code: "REFRESH_TOKEN_EXPIRED",
                });
                return;
            }
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                res.status(401).json({
                    success: false,
                    message: "Invalid refresh token signature",
                    code: "INVALID_REFRESH_SIGNATURE",
                });
                return;
            }
            res.status(401).json({
                success: false,
                message: "Invalid refresh token",
                code: "INVALID_REFRESH_TOKEN",
            });
        }
    }
    /**
     * Admin Only Middleware
     */
    static adminOnly(req, res, next) {
        if (req.user?.role !== "ADMIN") {
            res.status(403).json({
                success: false,
                message: "Admin access required",
                code: "FORBIDDEN",
            });
            return;
        }
        next();
    }
}
exports.AuthMiddleware = AuthMiddleware;
//# sourceMappingURL=auth.js.map