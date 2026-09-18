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

class ShippingAddressDto {
  @IsNotEmpty()
  @IsString()
  receiverName: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  city: string;
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  shippingMethod: string;

  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @IsObject()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];
}
