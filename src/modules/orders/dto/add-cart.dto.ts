import { IsNotEmpty, IsString } from 'class-validator';

export class AddCartDto {
  @IsNotEmpty()
  @IsString()
  variantId: string;

  @IsNotEmpty()
  @IsString()
  quantity: string;
}
