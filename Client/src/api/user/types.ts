export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  apiModelKey?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  token: string;
  expiresIn: number;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  apiModelKey?: string;
}
