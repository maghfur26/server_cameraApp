"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const userRoutes = (0, express_1.Router)();
/**
 * Public routes - No authentication required
 */
// Mobile login (return tokens in body)
userRoutes.post("/auth/login", validation_1.validateLogin, userController_1.UserController.login);
// Web login (set tokens in cookies)
userRoutes.post("/auth/login-web", validation_1.validateLogin, userController_1.UserController.loginWeb);
// Get all users (consider protecting this in production)
userRoutes.get("/users", userController_1.UserController.getAllUsers);
/**
 * Refresh token endpoint - Support both web and mobile
 * Web: Read from cookies, update cookies
 * Mobile: Read from Authorization header, return in body
 */
userRoutes.post("/auth/refresh-token", auth_1.AuthMiddleware.verifyRefreshToken, userController_1.UserController.refreshToken);
/**
 * Protected routes - Authentication required
 * Support both cookie-based (web) and token-based (mobile) auth
 */
userRoutes.use(auth_1.AuthMiddleware.verifyToken);
// Logout (works for both web and mobile)
userRoutes.post("/auth/logout", userController_1.UserController.logout);
// Delete current user
userRoutes.delete("/users/me", userController_1.UserController.deleteUser);
/**
 * Admin only routes
 */
userRoutes.post("/create-user", auth_1.AuthMiddleware.adminOnly, validation_1.validateCreateUser, userController_1.UserController.createUser);
userRoutes.delete("/users/:id", auth_1.AuthMiddleware.adminOnly, userController_1.UserController.deleteUser);
exports.default = userRoutes;
//# sourceMappingURL=userRoutes.js.map