import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/userService";
import { handleServiceError } from "../utils/errorHandler";
import type { CreateUser, LoginUser } from "../types/user.types";

export class UserController {
  /**
   * Get all users from the database
   */
  static async getAllUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const users = await UserService.getAllUsers();

      res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: users,
        count: users.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new user (admin only)
   */
  static async createUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userData: CreateUser = req.body;
      const newUser = await UserService.createUser(userData);

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * User login with email and password
   */
  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userData: LoginUser = req.body;
      const result = await UserService.login(userData);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user by clearing tokens
   */
  static async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      await UserService.logoutUser(req.user.id);

      res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user account
   */
  static async deleteUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      await UserService.deleteUser(req.user.id);

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const newTokens = await UserService.refreshToken(userId);

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: newTokens,
      });
    } catch (error) {
      next(error);
    }
  }
}
