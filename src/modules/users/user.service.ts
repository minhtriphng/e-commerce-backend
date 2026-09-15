import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { OtpService } from '../auth/services/otp.service';
import { RateLimitService } from '../../common/services/rate-limit.service';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly rateLimitService: RateLimitService,
  ) {}

  async emailExist(email: string) {
    const user = await this.userRepo.findOneBy({ email });
    if (user) {
      throw new ConflictException('Email đã tồn tại!');
    }
  }

  async validateUser(email: string, password: string) {
    await this.rateLimitService.check(
      `login:${email}`,
      5,
      300,
      'Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau 5 phút.',
    );
    const user = await this.userRepo.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu');
    }

    return user;
  }
}
