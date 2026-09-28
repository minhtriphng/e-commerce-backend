import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AuditLog {
  @IsNotEmpty()
  @IsString()
  productVariantId: string;

  @IsString()
  actorId: string | null;

  @IsNotEmpty()
  @IsNumber()
  oldStock: number;

  @IsNotEmpty()
  @IsNumber()
  newStock: number;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsString()
  referenceId?: string;
}
