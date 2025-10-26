export interface CreateUser {
  userName: string;
  email: string;
  password: string;
  role: string;
  createdBy: string;
}

export interface LoginUser {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  userName: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}
