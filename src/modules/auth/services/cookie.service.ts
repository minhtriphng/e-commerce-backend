import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { COOKIE_OPTIONS } from '../../../common/constants/cookie.constant';

@Injectable()
export class CookieService {
  constructor(private configService: ConfigService) {}

  setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    this.setAccessTokenCookie(res, accessToken);
    this.setRefreshTokenCookie(res, refreshToken);
  }

  setAccessTokenCookie(res: Response, accessToken: string) {
    res.cookie('access_token', accessToken, {
      httpOnly: COOKIE_OPTIONS.HTTP_ONLY, // Không cho JS truy cập (chống XSS)
      secure: this.configService.get('NODE_ENV') === 'production', // Chỉ HTTPS trong production
      sameSite: COOKIE_OPTIONS.SAME_SITE, // Chống CSRF (thay strict bằng lax)
      maxAge: COOKIE_OPTIONS.MAX_AGE_TOKEN_ON_COOKIE,
      path: COOKIE_OPTIONS.PATH,
    });
  }
  setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: COOKIE_OPTIONS.HTTP_ONLY,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: COOKIE_OPTIONS.SAME_SITE,
      maxAge: COOKIE_OPTIONS.MAX_AGE_COOKIE,
      path: COOKIE_OPTIONS.PATH,
    });
  }
  clearAuthCookies(res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }
}
