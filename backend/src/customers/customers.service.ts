import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.customer.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  }

  create(tenantId: string, data: CreateCustomerDto) {
    return this.prisma.customer.create({ data: { ...data, tenantId } });
  }
}
