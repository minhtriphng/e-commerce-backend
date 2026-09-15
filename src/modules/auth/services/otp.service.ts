import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { RateLimitService } from '../../../common/services/rate-limit.service';

@Injectable()
export class OtpService {
  constructor(
    private readonly redisService: RedisService,
    private readonly rateLimitService: RateLimitService,
  ) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 số
  }

  async sendOtp(email: string) {
    await this.rateLimitService.check(
      `otp:register:${email}`,
      1,
      60,
      'Vui lòng đợi 60s để gửi lại OTP',
    );

    const otp = this.generateOtp();

    return await this.redisService.set(`otp:register:${email}`, otp, 60);
  }

  async verifyOtp(email: string, otpInput: string) {
    const savedOtp = await this.redisService.get(`otp:register:${email}`);

    if (!savedOtp) {
      throw new BadRequestException('OTP hết hạn hoặc không tồn tại!');
    }
    await this.rateLimitService.check(
      `otp:fail:${email}`,
      5,
      300,
      'Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau 5 phút',
    );

    if (savedOtp !== otpInput) {
      throw new BadRequestException('OTP không đúng');
    }
    // Xóa đếm lần sai sau khi OTP đúng
    await this.redisService.del(`otp:fail:${email}`);
    // Xóa OTP sau khi dùng
    await this.redisService.del(`otp:register:${email}`);
  }
}
