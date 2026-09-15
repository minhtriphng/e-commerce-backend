import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { OtpService } from './services/otp.service';
import { UserService } from '../users/user.service';
import { RedisService } from '../redis/redis.service';
import { TokenService } from './services/token.service';
import { CookieService } from './services/cookie.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Session } from '../users/entities/session.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { RateLimitService } from '../../common/services/rate-limit.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Session])],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    UserService,
    RedisService,
    TokenService,
    CookieService,
    JwtService,
    ConfigService,
    JwtStrategy,
    GoogleStrategy,
    RateLimitService,
  ],
})
export class AuthModule {}
