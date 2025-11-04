import { Request, Response, NextFunction } from "express";
export declare class AuthMiddleware {
    /**
     * Verify Access Token - Support both Cookie (web) and Bearer (mobile)
     */
    static verifyToken(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Verify Refresh Token - Support both Cookie (web) and Bearer (mobile)
     */
    static verifyRefreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Admin Only Middleware
     */
    static adminOnly(req: Request, res: Response, next: NextFunction): void;
}
//# sourceMappingURL=auth.d.ts.map