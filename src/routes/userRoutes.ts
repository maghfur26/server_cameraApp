import { Router } from "express";
import { UserController } from "../controllers/userController";
import { validateCreateUser, validateLogin } from "../middleware/validation";
import { AuthMiddleware } from "../middleware/auth";

const userRoutes = Router();

/**
 * Public routes - No authentication required
 */
// Mobile login (return tokens in body)
userRoutes.post("/auth/login", validateLogin, UserController.login);

// Web login (set tokens in cookies)
userRoutes.post("/auth/login-web", validateLogin, UserController.loginWeb);

// Get all users (consider protecting this in production)
userRoutes.get("/users", UserController.getAllUsers);

/**
 * Refresh token endpoint - Support both web and mobile
 * Web: Read from cookies, update cookies
 * Mobile: Read from Authorization header, return in body
 */
userRoutes.post(
  "/auth/refresh-token",
  AuthMiddleware.verifyRefreshToken,
  UserController.refreshToken
);

/**
 * Protected routes - Authentication required
 * Support both cookie-based (web) and token-based (mobile) auth
 */
userRoutes.use(AuthMiddleware.verifyToken);

// Logout (works for both web and mobile)
userRoutes.post("/auth/logout", UserController.logout);

// Delete current user
userRoutes.delete("/users/me", UserController.deleteUser);

/**
 * Admin only routes
 */
userRoutes.post(
  "/create-user",
  AuthMiddleware.adminOnly,
  validateCreateUser,
  UserController.createUser
);

userRoutes.delete(
  "/users/:id",
  AuthMiddleware.adminOnly,
  UserController.deleteUser
);

export default userRoutes;
