export const USER_API_ROUTES = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: (id: string) => `/users/${id}`,
} as const;
