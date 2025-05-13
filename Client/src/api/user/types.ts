export type User ={
  userId: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  apiModelKey?: string;
}

export type LoginCredentials ={
  email: string;
  password: string;
}

export type RegisterCredentials ={
  email: string;
  password: string;
  name: string;
}

export type AuthResponse ={
  userId: string;
  name: string;
  email: string;
  createdAt: string;
  token: string;
  expiresIn: number;
}

export type UpdateUserRequest ={
  name: string;
  email: string;
  apiModelKey?: string;
}
