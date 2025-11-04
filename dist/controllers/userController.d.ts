import { Request, Response, NextFunction } from "express";
export declare class UserController {
    /**
     * Get all users from the database
     */
    static getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Create a new user (admin only)
     */
    static createUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Login for Mobile (return tokens in response)
     */
    static login(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Login for Web (with cookies)
     */
    static loginWeb(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Logout - Support both Web and Mobile
     */
    static logout(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete user account
     */
    static deleteUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Refresh access token using refresh token
     */
    static refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=userController.d.ts.map