import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class CreateInvoiceItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  qty: number;

  @Min(0)
  unitPrice: number;
}

export class CreateInvoiceDto {
  @IsString()
  customerId: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}
