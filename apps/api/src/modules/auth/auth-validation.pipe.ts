import { BadRequestException, PipeTransform } from '@nestjs/common'
import { z } from 'zod'

export class AuthValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: z.ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value)

    if (!result.success) {
      throw new BadRequestException('Invalid request data')
    }

    return result.data
  }
}
