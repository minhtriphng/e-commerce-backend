import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { COOKIE_OPTIONS } from './common/constants/cookie.constant';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  console.log('🟢 Bắt đầu khởi tạo app...');
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser()); // bắt buộc phải đặt trước port
  const port = process.env.PORT;
  await app.listen(port ?? 3000);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Bật class-transformer tự động
      whitelist: true, // Loại bỏ field không có decorator
      forbidNonWhitelisted: true, //báo lỗi khi dư field
    }),
  );

  console.log(`Hệ thống đang chạy localhost:${port}`);
}
bootstrap();
