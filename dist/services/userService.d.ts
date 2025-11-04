import type { CreateUser, LoginUser, LoginResponse, UserResponse } from "../types/user.types";
export declare class UserService {
    private static readonly SALT_ROUNDS;
    private static readonly USER_SELECT;
    /**
     * Get all users with minimal information
     */
    static getAllUsers(): Promise<UserResponse[]>;
    /**
     * Get single user by ID
     */
    static getUser(userId: string): Promise<UserResponse>;
    /**
     * Create a new user with hashed password
     */
    static createUser(userData: CreateUser): Promise<UserResponse>;
    /**
     * Authenticate user and generate tokens
     */
    static login(loginData: LoginUser): Promise<LoginResponse>;
    /**
     * Logout user by clearing tokens
     */
    static logoutUser(userId: string): Promise<void>;
    /**
     * Delete user account
     */
    static deleteUser(userId: string): Promise<void>;
    /**
     * Refresh access token using valid refresh token
     */
    static refreshToken(userId: string): Promise<{
        accessToken: string;
        refreshToken?: string;
    }>;
}
//# sourceMappingURL=userService.d.ts.map