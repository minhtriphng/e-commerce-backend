import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/enums/user.enum';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get('ip')
  getIp(@Req() req: any): string {
    const clientIp = req.ip;
    return `IP của bạn là: ${clientIp}`;
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.USER) // 👈 Quan trọng!
  @Get('validate-role')
  validateRole(@Req() req: any) {
    return {
      user: req.user,
      role: req.user.role,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('validate-jwt')
  validateJwt(@Req() req: any) {
    return req.user;
  }
  @Post('send-otp')
  sendOtp(@Body() body: SendOtpDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.sendOtp(body.email, res);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(loginDto, res);
  }

  //Bước 1: Khi user nhấn login bằng google
  @Get('google')
  @UseGuards(AuthGuard('google')) // chạy constructor
  async googleLogin() {} //viết đại hàm gì cũng được vì có hàm thì Guards mới dùng được

  // Bước 2: callback (sau khi login gg thành công) GET /auth/google/callback?code=xxxxx
  @Get('google/callback')
  @UseGuards(AuthGuard('google')) // passport tự động lấy code gửi lên gg để đổi access/refresh token/ và profile và chạy hàm validate
  async googleCallback(
    @Req() req: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.handleGoogleLogin(req.user, response);
  }

  @Post('refresh-token')
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const refresh_token = req.cookies?.refresh_token;
    return this.authService.refreshToken(refresh_token, res);
  }

  @Get('logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    return this.authService.logout(refreshToken, res);
  }

  @Get('logout-all')
  async logoutAll(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    return this.authService.logoutAll(refreshToken, res);
  }
}
