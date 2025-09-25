import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { handleServiceError } from "../utils/errorHandler";
import type { CreateUser, LoginUser } from "../types/user.types";
import prisma from "../config/dbconfig";

export class UserController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UserService.getAllUsers();

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "user not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "user retrived successfully",
        data: users,
      });
    } catch (error) {
      console.log("Error fetching users:", error);
      const appError = handleServiceError(error as Error);

      return res.status(appError.statusCode).json({
        success: false,
        message: appError.message,
      });
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      const userData: CreateUser = req.body;
      const newUser = await UserService.createUser(userData);

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: newUser,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      const appError = handleServiceError(error as Error);

      return res.status(appError.statusCode).json({
        success: false,
        message: appError.message,
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const userData: LoginUser = req.body;
      const result = await UserService.login(userData);

      return res.status(200).json({
        success: true,
        message: "Login successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error loggin:", error);
      const appError = handleServiceError(error as Error);
      return res.status(appError.statusCode).json({
        success: false,
        message: appError.message,
      });
    }
  }

  static async logut(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authenticaion required",
        });
      }

      await UserService.logutUser(req.user.id);

      return res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      console.error("Error during logout:", error);
      const appError = handleServiceError(error as Error);

      return res.status(appError.statusCode).json({
        success: false,
        message: appError.message,
      });
    }
  }

  // static async deleteUser(req: Request, res: Response) {
  //   try {
  //     const user = await prisma.user.findUnique({
  //       where: {
          
  //       }
  //     })
  //   } catch (error) {
      
  //   }
  // }
}
