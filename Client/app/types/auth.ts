export type User = {
  id: string;
  email: string;
};

export type Session = {
  user: User;
  token: string;
};

export type AuthResponse = {
  user: User;
  token: string;
  message?: string;
};
