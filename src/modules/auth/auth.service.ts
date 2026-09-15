import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { OtpService } from './services/otp.service';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { UserService } from '../users/user.service';
import { LoginDto } from './dto/login.dto';
import { TokenService } from './services/token.service';
import { Session } from '../users/entities/session.entity';
import { CookieService } from './services/cookie.service';
import { Provider } from '../../common/enums/provider.enum';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    private readonly otpService: OtpService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly cookieService: CookieService,
  ) {}
  async sendOtp(email: string, res: any) {
    await this.userService.emailExist(email);
    //Gửi OTP
    await this.otpService.sendOtp(email);
    res.message = 'Gửi OTP thành công!';
    return {};
  }

  async register(registerDto: RegisterDto) {
    const { firstName, lastName, email, password, otp } = registerDto;
    await this.otpService.verifyOtp(email, otp);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    // user.role = UserRole.ADMIN;
    await this.userRepo.save(user);
    return user;
  }

  async login(loginDto: LoginDto, res: any) {
    const { email, password } = loginDto;

    const user = await this.userService.validateUser(email, password);

    const payload = this.tokenService.createAuthPayload(user);
    const accessToken = this.tokenService.createAccessToken(payload);
    const refreshToken = this.tokenService.createRefreshToken(payload);

    const session = this.sessionRepo.create({
      user: user, // Gán user object
      refreshToken: refreshToken,
    });

    await this.sessionRepo.save(session);

    this.cookieService.setAuthCookies(res, accessToken, refreshToken);
    res.message = 'Đăng nhập thành công!';
    return accessToken;
  }

  async handleGoogleLogin(userData: any, res: any) {
    let user = await this.userRepo.findOneBy({ email: userData.email });
    if (user) {
      user.provider = Provider.GOOGLE;
      res.message = 'Liên kết Google thành công!';
      return '';
    }
    //Đăng kí với google
    user = this.userRepo.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      provider: Provider.GOOGLE,
    });
    user = await this.userRepo.save(user);
    const payload = this.tokenService.createAuthPayload(user);
    const accessToken = this.tokenService.createAccessToken(payload);
    const refreshToken = this.tokenService.createRefreshToken(payload);

    const session = this.sessionRepo.create({
      user: user, // Gán user object
      refreshToken: refreshToken,
    });
    await this.sessionRepo.save(session);
    this.cookieService.setAuthCookies(res, accessToken, refreshToken);
    res.message = 'Đăng nhập thành công!';
    return accessToken;
  }

  async refreshToken(refreshToken: string, res: any) {
    if (!refreshToken) {
      throw new ConflictException('Token không hợp lệ, vui lòng đăng nhập lại');
    }
    const payload = await this.tokenService.verifyToken(refreshToken);
    const session = await this.sessionRepo.findOne({
      where: {
        user: { id: payload.sub }, // ✅ đảm bảo đúng user
        refreshToken, // ✅ đảm bảo đúng session (thiết bị)
      },
      relations: { user: true },
    });
    if (!session) {
      await this.sessionRepo.delete({ user: { id: payload.sub } });
      throw new ConflictException('Token không hợp lệ, vui lòng đăng nhập lại');
    }
    const newPayload = this.tokenService.createAuthPayload(session.user);
    const newAccessToken = this.tokenService.createAccessToken(newPayload);
    const newRefreshToken = this.tokenService.createRefreshToken(newPayload);
    session.refreshToken = newRefreshToken;
    await this.sessionRepo.save(session);
    // Set access token mới
    this.cookieService.setAuthCookies(res, newAccessToken, newRefreshToken);
    res.message = 'Đã tạo access token mới!';
    // await this.userService.userExist(refreshToken);
    return {};
  }

  async logout(refreshToken: string, response: any) {
    if (!refreshToken) {
      throw new UnauthorizedException('Không có refresh token');
    }

    const result = await this.sessionRepo.delete({ refreshToken });

    // ✅ Kiểm tra số row bị xoá
    if (result.affected === 0) {
      throw new UnauthorizedException('Đăng xuất thất bại!');
      // hoặc: return { message: 'Đăng xuất thất bại!' };
    }

    this.cookieService.clearAuthCookies(response);
    response.message = 'Đăng xuất thành công!';
    return {};
  }

  async logoutAll(refreshToken: string, response: any) {
    if (!refreshToken) {
      throw new UnauthorizedException('Đăng xuất thất bại!');
    }
    const payload = await this.tokenService.verifyToken(refreshToken);

    await this.sessionRepo.delete({
      user: { id: payload.sub },
    });

    this.cookieService.clearAuthCookies(response);
    // Xóa cookies
    response.message = 'Đăng xuất toàn bộ thiết bị thành công!';

    return {};
  }
}
