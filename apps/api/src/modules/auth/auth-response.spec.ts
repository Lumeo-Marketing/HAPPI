import { describe, expect, it } from '@jest/globals'
import { ArgumentsHost, CallHandler, ConflictException, ExecutionContext } from '@nestjs/common'
import { lastValueFrom, of } from 'rxjs'

import { AuthExceptionFilter, AuthResponseInterceptor } from './auth-response'

describe('auth response format', () => {
  it('puts the HTTP status first in successful responses', async () => {
    const response = { statusCode: 201 }
    const context = {
      switchToHttp: () => ({ getResponse: () => response }),
    } as unknown as ExecutionContext
    const next = { handle: () => of({ message: 'Account created', devVerificationOtp: '123456' }) } as CallHandler

    const body = await lastValueFrom(new AuthResponseInterceptor().intercept(context, next))

    expect(body).toEqual({ statusCode: 201, message: 'Account created', devVerificationOtp: '123456' })
    expect(Object.keys(body as object)[0]).toBe('statusCode')
  })

  it('puts the HTTP status first in error responses', () => {
    let body: object | undefined
    const response = {
      status: () => response,
      json: (value: object) => { body = value },
    }
    const host = {
      switchToHttp: () => ({ getResponse: () => response }),
    } as unknown as ArgumentsHost

    new AuthExceptionFilter().catch(
      new ConflictException('An account already exists for this email'),
      host,
    )

    expect(body).toEqual({
      statusCode: 409,
      message: 'An account already exists for this email',
      error: 'Conflict',
    })
    expect(Object.keys(body!)[0]).toBe('statusCode')
  })
})
