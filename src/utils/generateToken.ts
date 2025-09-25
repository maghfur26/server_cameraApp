import jwt from "jsonwebtoken";

type TokenType = "accessToken" | "refreshToken";

export const generateToken = (
  type: TokenType,
  payload: object
): Promise<string> => {
  const secret =
    type === "accessToken"
      ? process.env.ACCESS_TOKEN_SECRET!
      : process.env.REFRESH_TOKEN_SECRET!;
      
  const expiresIn = type === "accessToken" ? "15m" : "7d";

  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, { expiresIn }, (err, token) => {
      if (err || !token) return reject(err ?? new Error("No token generated"));
      resolve(token);
    });
  });
};
