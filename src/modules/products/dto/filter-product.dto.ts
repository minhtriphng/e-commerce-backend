import { IsOptional, IsNumber, IsString, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterProductDto {
  @IsOptional()
  @IsString()
  categorySlug?: string; // Dùng slug để lọc theo danh mục cho chuẩn SEO (vd: 'dien-thoai')

  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  // Thuộc tính JSONB của Variant (vd: { ram: "8GB", color: "Đỏ" })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, string>;

  @IsString()
  limit: string;

  @IsString()
  cursor: string;
}
