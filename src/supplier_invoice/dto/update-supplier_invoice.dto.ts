import { IsEnum, IsNotEmpty } from 'class-validator';
import { SupplierInvoiceStatus } from './create-supplier_invoice.dto';

export class UpdateSupplierInvoiceDto {
  @IsNotEmpty()
  @IsEnum(SupplierInvoiceStatus)
  status: SupplierInvoiceStatus;
} 