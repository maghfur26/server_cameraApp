export interface JWTPayload {
  id: string;
  email: string;
  userName: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
