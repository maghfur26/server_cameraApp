import { Router } from "express";
import { UserController } from "../controllers/userController";
import { validateCreateUser, validateLogin } from "../middleware/validation";
import { AuthMiddleware } from "../middleware/auth";

const userRoutes = Router();

// public routes
userRoutes.post("/login", validateLogin, UserController.login);
userRoutes.get("/users", UserController.getAllUsers);

// protected routes
userRoutes.use(AuthMiddleware.verifyToken);

// admin only
userRoutes.post(
  "/create-user",
  AuthMiddleware.adminOnly,
  validateCreateUser,
  UserController.createUser
);
// userRoutes.post(
//   "delete-user",
//   AuthMiddleware.adminOnly,
//   UserController.deleteUser
// )

export default userRoutes;
