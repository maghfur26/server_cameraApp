"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleServiceError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
const handleServiceError = (error) => {
    switch (error.message) {
        case "USER_ALREADY_EXISTING":
            return new AppError("User already existing", 409);
        case "INVALID_CREDENTIALS":
            return new AppError("Invalid email or password", 401);
        case "USER_NOT_FOUND":
            return new AppError("User not found", 404);
        case "REFRESH_TOKEN_NOT_FOUND":
            return new AppError("Refresh token not found", 404);
        case "ID_NOT_FOUND":
            return new AppError("ID not found", 404);
        default:
            return new AppError("internal server error", 500);
    }
};
exports.handleServiceError = handleServiceError;
//# sourceMappingURL=errorHandler.js.map