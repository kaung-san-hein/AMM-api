import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  phone_no: string;

  @IsNotEmpty()
  @IsString()
  address: string;
}
