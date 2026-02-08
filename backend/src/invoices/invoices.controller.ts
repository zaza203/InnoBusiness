import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { TenantRequest } from '../common/tenant.middleware';
import { CreateInvoiceDto } from './dto';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  list(@Req() req: TenantRequest) {
    return this.invoicesService.list(req.tenantId);
  }

  @Get(':id')
  getById(@Req() req: TenantRequest, @Param('id') id: string) {
    return this.invoicesService.getById(req.tenantId, id);
  }

  @Post()
  create(@Req() req: TenantRequest, @Body() body: CreateInvoiceDto) {
    return this.invoicesService.create(req.tenantId, body);
  }
}
