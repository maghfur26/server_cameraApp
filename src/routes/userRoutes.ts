import { Router } from "express";
import { UserController } from "../controllers/userController";
import { validateCreateUser, validateLogin } from "../middleware/validation";
import { AuthMiddleware } from "../middleware/auth";

const userRoutes = Router();

/**
 * Public routes - No authentication required
 */
userRoutes.post("/auth/login", validateLogin, UserController.login);
userRoutes.get("/users", UserController.getAllUsers);

userRoutes.post(
  "/auth/refresh-token",
  AuthMiddleware.verifyRefreshToken,
  UserController.refreshToken
);

/**
 * Protected routes - Authentication required
 */
userRoutes.use(AuthMiddleware.verifyToken);

// User routes
userRoutes.post("/auth/logout", UserController.logout);
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
