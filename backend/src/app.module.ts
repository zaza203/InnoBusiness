import { MiddlewareConsumer, Module } from '@nestjs/common';
import { CustomersModule } from './customers/customers.module';
import { ExpensesModule } from './expenses/expenses.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { ProductsModule } from './products/products.module';
import { PrismaModule } from './prisma/prisma.module';
import { TenantMiddleware } from './common/tenant.middleware';

@Module({
  imports: [
    PrismaModule,
    CustomersModule,
    ProductsModule,
    InvoicesModule,
    PaymentsModule,
    ExpensesModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
