type TokenType = "accessToken" | "refreshToken";
export declare const generateToken: (type: TokenType, payload: object) => Promise<string>;
export declare const updateAccessToken: (userId: string, accessToken: string) => Promise<void>;
export {};
//# sourceMappingURL=generateToken.d.ts.map