import {
  CanActivate,
  ExecutionContext,
  mixin,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/auth/types';

export const AuthorizeGuard = (allowedRole: string) => {
  class RolesGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const result =
        (request?.currentUser as User | null)?.role?.name === allowedRole;

      if (result) return true;

      throw new UnauthorizedException('Sorry, you are not authorized!');
    }
  }

  const guard = mixin(RolesGuardMixin);
  return guard;
};
