export const USER_API_ROUTES = {
  LOGIN: '/users/login',
  REGISTER: '/users/register',
  PASSWORD_RESET: '/users/password-reset',
  PROFILE_BY_ID: (id: string) => `/users/${id}`,
  PASSWORD_UPDATE: (id: string) => `/users/${id}/password`,
} as const;
