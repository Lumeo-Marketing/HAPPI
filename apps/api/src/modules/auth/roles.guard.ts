import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import type { AuthenticatedRequest } from './access-token.guard'
import { UserRole } from './entities/auth.enums'
import { ROLES_KEY } from './roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!roles?.length) {
      return true
    }

    const user = context.switchToHttp().getRequest<AuthenticatedRequest>().authUser

    if (!user) {
      throw new UnauthorizedException()
    }

    if (!roles.includes(user.role)) {
      throw new ForbiddenException()
    }

    return true
  }
}
