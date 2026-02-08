import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.payment.findMany({ where: { tenantId }, orderBy: { paidAt: 'desc' } });
  }

  create(tenantId: string, data: CreatePaymentDto) {
    return this.prisma.payment.create({ data: { ...data, tenantId } });
  }
}
