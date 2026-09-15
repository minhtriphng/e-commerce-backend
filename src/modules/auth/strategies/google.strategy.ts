// google.strategy.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      state: false, // true:NestJS/Passport tự quản lý state chống CSRF
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    //accessToken và refreshToken này là parameter của hàm của google trả về(bắt buộc)
    const { name, emails } = profile;
    return {
      // Dùng dấu ?. để nếu nó không có thì trả về undefined thay vì làm crash app(! là chắc chắn có sẽ gây crash nếu null|undefined)
      email: emails?.[0]?.value,
      firstName: name?.givenName,
      lastName: name?.familyName,
    };
  }
} //sau khi chạy hàm validate trong request sẽ tự có thuộc tính user

// 1. Lúc khởi động Server (Constructor chạy)
// Ngay khi bạn gõ lệnh npm run start, NestJS sẽ quét qua các class. Nó thấy GoogleStrategy, nó sẽ khởi tạo (new) class này một lần duy nhất.

// Nhiệm vụ: Lúc này constructor chạy để "đăng ký" với hệ thống rằng: "Tôi là một chiến lược login Google, dùng ClientID này, Secret này, và nếu xong thì gọi về URL này nhé".

// Kết quả: constructor thiết lập xong "máy móc" và đứng đợi.

// 2. Lúc User nhấn nút "Login Google" (Request 1)
// User truy cập /auth/google.

// Guard nhìn vào cấu hình mà constructor đã thiết lập lúc nãy.

// Nó thấy clientID, scope, callbackURL... rồi nó tự động tạo ra một đường link dài loằng ngoằng của Google và Redirect người dùng đi.

// 3. Lúc User nhập pass xong tại Google (Request 2)
// Google gửi mã code về /auth/google/callback.

// NestJS nhận cái code đó, âm thầm gửi sang Google đổi lấy accessToken và profile.

// Lúc này hàm validate mới chạy.
