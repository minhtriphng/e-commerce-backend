// src/auth/dto/login.dto.ts
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  oldPassword!: string;
}
