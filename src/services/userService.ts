import prisma from "../config/dbconfig";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken";
import type {
  CreateUser,
  LoginUser,
  LoginResponse,
  UserResponse,
} from "../types/user.types";

export class UserService {
  private static readonly SALT_ROUNDS = parseInt(
    process.env.SALT_ROUNDS || "12"
  );

  private static readonly USER_SELECT = {
    id: true,
    userName: true,
    email: true,
    role: true,
  };

  /**
   * Get all users with minimal information
   */
  static async getAllUsers(): Promise<UserResponse[]> {
    const users = await prisma.user.findMany({
      select: this.USER_SELECT,
    });

    return users;
  }

  /**
   * Get single user by ID
   */
  static async getUser(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: this.USER_SELECT,
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    return user;
  }

  /**
   * Create a new user with hashed password
   */
  static async createUser(userData: CreateUser): Promise<UserResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new Error("USER_ALREADY_EXISTING");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      userData.password,
      this.SALT_ROUNDS
    );

    // Create user
    const newUser = await prisma.user.create({
      data: {
        userName: userData.userName,
        email: userData.email,
        password: hashedPassword,
        role: userData.role?.toUpperCase(),
      },
      select: this.USER_SELECT,
    });

    return newUser;
  }

  /**
   * Authenticate user and generate tokens
   */
  static async login(loginData: LoginUser): Promise<LoginResponse> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: loginData.email },
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginData.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error("INVALID_CREDENTIALS");
    }

    // Generate tokens
    const payload = {
      id: user.id,
      email: user.email,
      userName: user.userName,
      role: user.role,
    };

    const accessToken = await generateToken("accessToken", payload);
    const refreshToken = await generateToken("refreshToken", payload);

    // Store tokens in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        accessToken,
        refreshToken,
      },
    });

    return {
      user: {
        id: user.id,
        userName: user.userName,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Logout user by clearing tokens
   */
  static async logoutUser(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        accessToken: null,
        refreshToken: null,
      },
    });
  }

  /**
   * Delete user account
   */
  static async deleteUser(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    await prisma.user.delete({
      where: { id: userId },
    });
  }

  /**
   * Refresh access token using valid refresh token
   */
  static async refreshToken(userId: string): Promise<{
    accessToken: string;
    refreshToken?: string;
  }> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // Generate new tokens
    const payload = {
      id: user.id,
      email: user.email,
      userName: user.userName,
      role: user.role,
    };

    const newAccessToken = await generateToken("accessToken", payload);

    // RECOMMENDED: Rotate refresh token untuk keamanan lebih baik
    const newRefreshToken = await generateToken("refreshToken", payload);

    // Update both tokens in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}