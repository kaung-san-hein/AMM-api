import {
  CanActivate,
  ExecutionContext,
  mixin,
  UnauthorizedException,
} from '@nestjs/common';

export const AuthorizeGuard = (allowedRole: number) => {
  class RolesGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const result = request?.currentUser?.role_id === allowedRole;

      if (result) return true;

      throw new UnauthorizedException('Sorry, you are not authorized!');
    }
  }

  const guard = mixin(RolesGuardMixin);
  return guard;
};
