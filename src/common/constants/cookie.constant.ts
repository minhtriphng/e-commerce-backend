export const COOKIE_OPTIONS = {
  HTTP_ONLY: true,
  SAME_SITE: 'lax',
  PATH: '/',
  MAX_AGE_TOKEN_ON_COOKIE: 15 * 60 * 1000, // 15 phút
  MAX_AGE_COOKIE: 7 * 24 * 60 * 60 * 1000, // 7 ngày
} as const;
