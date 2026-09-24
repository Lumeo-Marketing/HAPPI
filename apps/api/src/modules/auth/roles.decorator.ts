import { SetMetadata } from '@nestjs/common'

import { UserRole } from './entities/auth.enums'

export const ROLES_KEY = 'happi:auth:roles'

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles)
