import { Module } from '@nestjs/common';
import { SupplierInvoiceService } from './supplier_invoice.service';
import { SupplierInvoiceController } from './supplier_invoice.controller';

@Module({
  controllers: [SupplierInvoiceController],
  providers: [SupplierInvoiceService],
})
export class SupplierInvoiceModule {}
