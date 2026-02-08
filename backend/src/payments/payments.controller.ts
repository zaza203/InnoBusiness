import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { TenantRequest } from '../common/tenant.middleware';
import { CreatePaymentDto } from './dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  list(@Req() req: TenantRequest) {
    return this.paymentsService.list(req.tenantId);
  }

  @Post()
  create(@Req() req: TenantRequest, @Body() body: CreatePaymentDto) {
    return this.paymentsService.create(req.tenantId, body);
  }
}
