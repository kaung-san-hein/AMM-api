import { IsEnum, IsNotEmpty } from 'class-validator';

export enum RoleName {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MODERATOR = 'MODERATOR',
}

export class CreateRoleDto {
  @IsNotEmpty()
  @IsEnum(RoleName, { message: 'Role must be one of ADMIN, USER, MODERATOR' })
  name: RoleName;
}
