import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { TenantRequest } from '../common/tenant.middleware';
import { CreateProductDto } from './dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(@Req() req: TenantRequest) {
    return this.productsService.list(req.tenantId);
  }

  @Post()
  create(@Req() req: TenantRequest, @Body() body: CreateProductDto) {
    return this.productsService.create(req.tenantId, body);
  }
}
