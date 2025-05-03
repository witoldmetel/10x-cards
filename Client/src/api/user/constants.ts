export const USER_API_ROUTES = {
  LOGIN: '/api/users/login',
  REGISTER: '/api/users/register',
  PASSWORD_RESET: '/api/users/password-reset',
  PROFILE_BY_ID: (id: string) => `/api/users/${id}`
} as const;
