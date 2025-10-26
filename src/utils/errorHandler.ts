export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const handleServiceError = (error: Error) => {
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
