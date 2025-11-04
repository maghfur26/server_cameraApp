"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const dbconfig_1 = __importDefault(require("../config/dbconfig"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const generateToken_1 = require("../utils/generateToken");
class UserService {
    /**
     * Get all users with minimal information
     */
    static async getAllUsers() {
        const users = await dbconfig_1.default.user.findMany({
            select: this.USER_SELECT,
        });
        return users;
    }
    /**
     * Get single user by ID
     */
    static async getUser(userId) {
        const user = await dbconfig_1.default.user.findUnique({
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
    static async createUser(userData) {
        // Check if user already exists
        const existingUser = await dbconfig_1.default.user.findUnique({
            where: { email: userData.email },
        });
        if (existingUser) {
            throw new Error("USER_ALREADY_EXISTING");
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(userData.password, this.SALT_ROUNDS);
        // Create user
        const newUser = await dbconfig_1.default.user.create({
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
    static async login(loginData) {
        // Find user by email
        const user = await dbconfig_1.default.user.findUnique({
            where: { email: loginData.email },
        });
        if (!user) {
            throw new Error("USER_NOT_FOUND");
        }
        // Verify password
        const isPasswordValid = await bcrypt_1.default.compare(loginData.password, user.password);
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
        const accessToken = await (0, generateToken_1.generateToken)("accessToken", payload);
        const refreshToken = await (0, generateToken_1.generateToken)("refreshToken", payload);
        // Store tokens in database
        await dbconfig_1.default.user.update({
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
    static async logoutUser(userId) {
        await dbconfig_1.default.user.update({
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
    static async deleteUser(userId) {
        const user = await dbconfig_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error("USER_NOT_FOUND");
        }
        await dbconfig_1.default.user.delete({
            where: { id: userId },
        });
    }
    /**
     * Refresh access token using valid refresh token
     */
    static async refreshToken(userId) {
        // Find user
        const user = await dbconfig_1.default.user.findUnique({
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
        const newAccessToken = await (0, generateToken_1.generateToken)("accessToken", payload);
        // RECOMMENDED: Rotate refresh token untuk keamanan lebih baik
        const newRefreshToken = await (0, generateToken_1.generateToken)("refreshToken", payload);
        // Update both tokens in database
        await dbconfig_1.default.user.update({
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
exports.UserService = UserService;
UserService.SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "12");
UserService.USER_SELECT = {
    id: true,
    userName: true,
    email: true,
    role: true,
};
//# sourceMappingURL=userService.js.map