import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IsAlphaOnly } from '../../../common/decorators/is-alpha.decorator';
export class RegisterDto {
  @IsAlphaOnly()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim()) // xóa space ở đầu cuối
  lastName!: string;

  @IsAlphaOnly()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  firstName!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  otp!: string;
}
