import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.product.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  }

  create(tenantId: string, data: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...data,
        tenantId,
        stockQty: data.stockQty ?? 0,
      },
    });
  }
}
