export interface User {
  id: string;
  fullName: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  expiresAtUtc: string;
  user: User;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}