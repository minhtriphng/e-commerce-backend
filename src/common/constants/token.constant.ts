export const TOKEN_OPTIONS = {
  EXPIRES_IN_TOKEN: '15m', // 15 phút
  EXPIRES_IN_REFRESH_TOKEN: '7d', // 7 ngày
  EXPIRES_IN_REFRESH_TOKEN_DB: 7 * 24 * 60 * 60 * 1000, // 7 ngày
} as const;
