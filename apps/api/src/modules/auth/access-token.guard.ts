import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, MoreThan, Repository } from 'typeorm'

import { AuthSession } from './entities/auth-session.entity'
import { UserRole, UserStatus } from './entities/auth.enums'
import { User } from './entities/user.entity'
import { TokenService } from './token.service'

export interface AuthenticatedUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  emailVerified: boolean
}

export interface AuthenticatedRequest {
  headers: { authorization?: string }
  authUser?: AuthenticatedUser
}

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokens: TokenService,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(AuthSession)
    private readonly sessions: Repository<AuthSession>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const authorization = request.headers.authorization
    const match = /^Bearer (\S+)$/i.exec(authorization ?? '')

    if (!match) {
      throw new UnauthorizedException()
    }

    try {
      const { sub, sid } = await this.tokens.verifyAccessToken(match[1])

      if (typeof sub !== 'string' || typeof sid !== 'string') {
        throw new UnauthorizedException()
      }

      const [session, user] = await Promise.all([
        this.sessions.findOneBy({
          id: sid,
          userId: sub,
          revokedAt: IsNull(),
          expiresAt: MoreThan(new Date()),
        }),
        this.users.findOneBy({ id: sub }),
      ])

      if (!session || !user || !user.emailVerifiedAt || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException()
      }

      request.authUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: true,
      }
      return true
    } catch {
      throw new UnauthorizedException()
    }
  }
}
