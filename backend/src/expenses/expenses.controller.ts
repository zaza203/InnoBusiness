import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { TenantRequest } from '../common/tenant.middleware';
import { CreateExpenseDto } from './dto';
import { ExpensesService } from './expenses.service';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  list(@Req() req: TenantRequest) {
    return this.expensesService.list(req.tenantId);
  }

  @Post()
  create(@Req() req: TenantRequest, @Body() body: CreateExpenseDto) {
    return this.expensesService.create(req.tenantId, body);
  }
}
