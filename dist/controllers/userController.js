"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const userService_1 = require("../services/userService");
class UserController {
    /**
     * Get all users from the database
     */
    static async getAllUsers(req, res, next) {
        try {
            const users = await userService_1.UserService.getAllUsers();
            res.status(200).json({
                success: true,
                message: "Users retrieved successfully",
                data: users,
                count: users.length,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Create a new user (admin only)
     */
    static async createUser(req, res, next) {
        try {
            const userData = req.body;
            const newUser = await userService_1.UserService.createUser(userData);
            res.status(201).json({
                success: true,
                message: "User created successfully",
                data: newUser,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Login for Mobile (return tokens in response)
     */
    static async login(req, res, next) {
        try {
            const userData = req.body;
            const result = await userService_1.UserService.login(userData);
            res.status(200).json({
                success: true,
                message: "Login successful",
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Login for Web (with cookies)
     */
    static async loginWeb(req, res, next) {
        try {
            const userData = req.body;
            const result = await userService_1.UserService.login(userData);
            const resultData = {
                user: {
                    id: result.user.id,
                    userName: result.user.userName,
                    email: result.user.email,
                    role: result.user.role,
                },
            };
            res.cookie("access_token", result.accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 15 * 60 * 1000, // 15 minutes
            });
            res.cookie("refresh_token", result.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            res.status(200).json({
                success: true,
                message: "Login successful",
                data: resultData,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Logout - Support both Web and Mobile
     */
    static async logout(req, res, next) {
        try {
            if (!req.user?.id) {
                res.status(401).json({
                    success: false,
                    message: "Authentication required",
                });
                return;
            }
            await userService_1.UserService.logoutUser(req.user.id);
            // ✅ Clear cookies jika request dari web
            if (req.cookies?.access_token || req.cookies?.refresh_token) {
                res.clearCookie("access_token", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                });
                res.clearCookie("refresh_token", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                });
            }
            res.status(200).json({
                success: true,
                message: "Logout successful",
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Delete user account
     */
    static async deleteUser(req, res, next) {
        try {
            const userIdToDelete = req.params.id;
            if (!userIdToDelete) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required",
                });
                return;
            }
            if (!req.user?.id) {
                res.status(401).json({
                    success: false,
                    message: "Authentication required",
                });
                return;
            }
            await userService_1.UserService.deleteUser(userIdToDelete);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Refresh access token using refresh token
     */
    static async refreshToken(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Authentication required",
                });
                return;
            }
            const newTokens = await userService_1.UserService.refreshToken(userId);
            // ✅ Check if request from web (has cookies) or mobile (bearer token)
            const isWebRequest = !!req.cookies?.refresh_token;
            if (isWebRequest) {
                // ✅ WEB: Update cookies dengan token baru
                res.cookie("access_token", newTokens.accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                    maxAge: 15 * 60 * 1000, // 15 minutes
                });
                if (newTokens.refreshToken) {
                    res.cookie("refresh_token", newTokens.refreshToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                    });
                }
                // Response tanpa token di body (karena sudah di cookies)
                res.status(200).json({
                    success: true,
                    message: "Token refreshed successfully",
                });
            }
            else {
                // ✅ MOBILE: Return token di response body
                res.status(200).json({
                    success: true,
                    message: "Token refreshed successfully",
                    data: newTokens,
                });
            }
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=userController.js.map