import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.invoice.findMany({
      where: { tenantId },
      include: { items: true, customer: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  getById(tenantId: string, id: string) {
    return this.prisma.invoice.findFirst({
      where: { tenantId, id },
      include: { items: true, customer: true, payments: true },
    });
  }

  async create(tenantId: string, data: CreateInvoiceDto) {
    const total = data.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
    return this.prisma.invoice.create({
      data: {
        tenantId,
        customerId: data.customerId,
        status: 'open',
        total,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            qty: item.qty,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: { items: true },
    });
  }
}
