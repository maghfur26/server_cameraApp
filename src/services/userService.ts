import prisma from "../config/dbconfig";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateToken, updateAccessToken } from "../utils/generateToken";
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

  static async getAllUsers(): Promise<UserResponse[]> {
    const user = await prisma.user.findMany({
      select: {
        id: true,
        userName: true,
        email: true,
        role: true,
      },
    });

    return user;
  }

  static async getUser(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        userName: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    return user;
  }

  static async createUser(userData: CreateUser): Promise<UserResponse> {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: userData.email,
      },
    });

    if (existingUser) {
      throw new Error("USER_ALREADY_EXISTING");
    }

    // hash password
    const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
    const hashedPassoword = await bcrypt.hash(userData.password, salt);

    // create user
    const newUser = await prisma.user.create({
      data: {
        userName: userData.userName,
        email: userData.email,
        password: hashedPassoword,
        role: userData.role,
      },
      select: {
        id: true,
        userName: true,
        email: true,
        role: true,
      },
    });

    return newUser;
  }

  static async login(loginData: LoginUser): Promise<LoginResponse> {
    const user = await prisma.user.findUnique({
      where: { email: loginData.email },
    });

    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    // Verify Password
    const isPasswordMatch = await bcrypt.compare(
      loginData.password,
      user.password
    );
    if (!isPasswordMatch) {
      throw new Error("INVALID_CREDENTIALS");
    }

    // generate tokens
    const payload = {
      id: user.id,
      email: user.email,
      userName: user.email,
      role: user.role,
    };

    const accessToken = await generateToken("accessToken", payload);
    const refreshToken = await generateToken("refreshToken", payload);

    // update user with new tokens
    await prisma.user.update({
      where: { email: loginData.email },
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

  static async logutUser(userId: string) {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        accessToken: null,
        refreshToken: null,
      },
    });
  }

  static async deleteUser(email: string) {
    await prisma.user.delete({
      where: {
        id: email,
      },
    });
  }

  static async updateToken(refreshToken: string) {
    if (!refreshToken) {
      throw new Error("REFRESH_TOKEN_NOT_FOUND");
    }

    const user = await prisma.user.findFirst({
      where: { refreshToken },
    });

    if (!user) {
      throw new Error("INVALID_REFRESH_TOKEN");
    }

    try {
      const decoded: any = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET || "refresh-secret"
      );

      const payload = {
        id: user.id,
        email: user.email,
        userName: user.userName,
        role: user.role,
      };

      const newAccessToken = await generateToken("accessToken", payload);

      await prisma.user.update({
        where: { id: user.id },
        data: { accessToken: newAccessToken },
      });

      return {
        accessToken: newAccessToken,
        refreshToken,
      };
    } catch (err) {
      throw new Error("INVALID_REFRESH_TOKEN");
    }
  }
}
