import { IsEnum } from 'class-validator';
import { UserRole } from '../../../common/enums/user.enum';

export class AuthPayloadDto {
  sub!: string;
  email!: string;
  @IsEnum(UserRole)
  role!: UserRole;
}
