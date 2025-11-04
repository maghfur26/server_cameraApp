export declare class AppError extends Error {
    message: string;
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode: number, isOperational?: boolean);
}
export declare const handleServiceError: (error: Error) => AppError;
//# sourceMappingURL=errorHandler.d.ts.map