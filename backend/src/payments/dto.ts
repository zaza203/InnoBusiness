import { IsNumber, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  invoiceId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  method: string;
}
