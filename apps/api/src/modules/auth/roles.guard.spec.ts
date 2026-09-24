import { describe, expect, it } from '@jest/globals'
import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import type { AuthenticatedUser } from './access-token.guard'
import { UserRole } from './entities/auth.enums'
import { Roles } from './roles.decorator'
import { RolesGuard } from './roles.guard'

class ProtectedController {
  @Roles(UserRole.THERAPIST)
  restricted() {}

  publicRoute() {}
}

function contextFor(
  handler: keyof ProtectedController,
  authUser?: AuthenticatedUser,
): ExecutionContext {
  return {
    getHandler: () => ProtectedController.prototype[handler],
    getClass: () => ProtectedController,
    switchToHttp: () => ({ getRequest: () => ({ authUser }) }),
  } as unknown as ExecutionContext
}

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector())
  const user = {
    id: 'user-id',
    email: 'ada@example.com',
    firstName: 'Ada',
    lastName: 'Okafor',
    emailVerified: true,
    role: UserRole.CLIENT,
  }

  it('allows an authenticated user with the required role', () => {
    expect(
      guard.canActivate(
        contextFor('restricted', { ...user, role: UserRole.THERAPIST }),
      ),
    ).toBe(true)
  })

  it('rejects a user with the wrong role', () => {
    expect(() => guard.canActivate(contextFor('restricted', user))).toThrow(
      ForbiddenException,
    )
  })

  it('rejects a missing authenticated user', () => {
    expect(() => guard.canActivate(contextFor('restricted'))).toThrow(
      UnauthorizedException,
    )
  })

  it('does not apply role restrictions to an undecorated handler', () => {
    expect(guard.canActivate(contextFor('publicRoute'))).toBe(true)
  })
})
