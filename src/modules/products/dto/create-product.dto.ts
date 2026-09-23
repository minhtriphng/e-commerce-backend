import {
  IsString,
  IsNumber,
  IsOptional,
  IsUrl,
  IsArray,
  ValidateNested,
  Min,
  IsObject,
  IsNotEmpty,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsAlphaOnly } from '../../../common/decorators/is-alpha.decorator';

class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  id!: string;
}

class CreateProductVariantDto {
  @IsObject()
  attributes!: Record<string, string>;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @Min(0)
  stock!: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsAlphaOnly()
  description!: string;

  @IsUrl()
  thumbnailUrl!: string;

  @IsArray()
  @ArrayMaxSize(3)
  @IsUrl({}, { each: true })
  @IsOptional()
  galleryUrls?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  oldPrice?: number;

  @IsNumber()
  @Min(0)
  newPrice!: number;

  @IsObject()
  category!: CreateCategoryDto;

  @IsArray()
  @ValidateNested({ each: true }) //dùng để validate các object bên trong một mảng hoặc object, each:true là áp dụng cho từng phần tử trong mảng(false là chỉ lấy cái đầu)
  @Type(() => CreateProductVariantDto)
  variants!: CreateProductVariantDto[];
}
