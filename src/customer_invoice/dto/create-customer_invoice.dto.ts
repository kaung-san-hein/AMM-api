import {
  IsNotEmpty,
  IsNumber,
  IsDate,
  ValidateNested,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CustomerInvoiceItem {
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

export class CreateCustomerInvoiceDto {
  @IsNotEmpty()
  @IsNumber()
  customer_id: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsNotEmpty()
  @IsNumber()
  total: number;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CustomerInvoiceItem)
  items: CustomerInvoiceItem[];
}
