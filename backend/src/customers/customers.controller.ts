import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { CreateCustomerDto } from './dto';
import { CustomersService } from './customers.service';
import { TenantRequest } from '../common/tenant.middleware';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  list(@Req() req: TenantRequest) {
    return this.customersService.list(req.tenantId);
  }

  @Post()
  create(@Req() req: TenantRequest, @Body() body: CreateCustomerDto) {
    return this.customersService.create(req.tenantId, body);
  }
}
