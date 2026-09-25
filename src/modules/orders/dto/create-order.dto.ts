import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CartItemDto {
  @IsNotEmpty()
  @IsString()
  productVariantId: string;

  @IsNotEmpty()
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];
}
