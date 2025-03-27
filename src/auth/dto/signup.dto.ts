import { IsNotEmpty, IsString } from 'class-validator';
import { AuthDto } from './auth.dto';

export class SignupDto extends AuthDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
