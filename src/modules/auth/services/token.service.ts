import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TOKEN_OPTIONS } from '../../../common/constants/token.constant';
import { User } from '../../users/entities/user.entity';
import { AuthPayloadDto } from '../dto/auth-payload.dto';
import { UserService } from '../../users/user.service';
@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UserService,
  ) {}
  createAuthPayload(user: User): AuthPayloadDto {
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
  }

  createAccessToken(payload: any) {
    // Tạo access token (15 phút)
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: TOKEN_OPTIONS.EXPIRES_IN_TOKEN,
    });

    return accessToken;
  }
  createRefreshToken(payload: any) {
    // Tạo refresh token (7 ngày)
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: TOKEN_OPTIONS.EXPIRES_IN_REFRESH_TOKEN,
    });

    return refreshToken;
  }

  async verifyToken(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
    });
    return payload;
  }
}
