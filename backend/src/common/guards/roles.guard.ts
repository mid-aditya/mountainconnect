import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

export enum UserRole {
  SOLO_TRAVELER = 'solo_traveler',
  OPERATOR = 'operator',
  GUIDE = 'guide',
  BASE_CAMP = 'basecamp',
  TN_ADMIN = 'tn_admin',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles) {
      throw new ForbiddenException('Access denied: No roles assigned');
    }

    const hasRole = requiredRoles.some((role) => user.roles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied: Required roles [${requiredRoles.join(', ')}]`,
      );
    }

    return true;
  }
}
