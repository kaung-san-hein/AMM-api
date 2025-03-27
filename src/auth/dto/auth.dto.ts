import { IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @IsNotEmpty()
  @IsString()
  phoneNo: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
