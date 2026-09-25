import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import type { AuthenticatedRequest } from './access-token.guard'

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().authUser,
)
