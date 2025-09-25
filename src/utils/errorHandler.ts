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
    default:
      return new AppError("internal server error", 500);
  }
};
