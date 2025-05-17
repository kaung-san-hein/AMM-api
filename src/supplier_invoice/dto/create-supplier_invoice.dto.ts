import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsDate,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
} from 'class-validator';

export class SupplierInvoiceItem {
  @IsNotEmpty()
  @IsNumber()
  product_id: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}

export class CreateSupplierInvoiceDto {
  @IsNotEmpty()
  @IsNumber()
  supplier_id: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsNotEmpty()
  @IsNumber()
  total: number;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SupplierInvoiceItem)
  items: SupplierInvoiceItem[];
}
