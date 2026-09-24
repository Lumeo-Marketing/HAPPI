import { describe, expect, it } from '@jest/globals'
import { BadRequestException } from '@nestjs/common'

import { registrationSchema } from './auth.schemas'
import { AuthValidationPipe } from './auth-validation.pipe'

describe('AuthValidationPipe', () => {
  const pipe = new AuthValidationPipe(registrationSchema)

  it('normalizes valid registration input', () => {
    expect(
      pipe.transform({
        email: '  ADA@EXAMPLE.COM  ',
        password: 'correct-horse-battery',
        firstName: '  Ada  ',
        lastName: ' Okafor ',
        role: 'client',
      }),
    ).toEqual({
      email: 'ada@example.com',
      password: 'correct-horse-battery',
      firstName: 'Ada',
      lastName: 'Okafor',
      role: 'client',
    })
  })

  it('rejects admin registration through the public endpoint', () => {
    expect(() =>
      pipe.transform({
        email: 'admin@example.com',
        password: 'correct-horse-battery',
        firstName: 'Ada',
        lastName: 'Okafor',
        role: 'admin',
      }),
    ).toThrow(BadRequestException)
  })
})
