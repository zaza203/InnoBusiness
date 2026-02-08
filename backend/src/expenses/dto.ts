import { IsDateString, IsNumber, IsString, Min } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  vendor: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  category: string;

  @IsDateString()
  occurredAt: string;
}
