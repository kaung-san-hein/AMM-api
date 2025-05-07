import { Module } from '@nestjs/common';
import { CustomerInvoiceService } from './customer_invoice.service';
import { CustomerInvoiceController } from './customer_invoice.controller';

@Module({
  controllers: [CustomerInvoiceController],
  providers: [CustomerInvoiceService],
})
export class CustomerInvoiceModule {}
