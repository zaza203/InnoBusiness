import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.expense.findMany({ where: { tenantId }, orderBy: { occurredAt: 'desc' } });
  }

  create(tenantId: string, data: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        ...data,
        tenantId,
        occurredAt: new Date(data.occurredAt),
      },
    });
  }
}
