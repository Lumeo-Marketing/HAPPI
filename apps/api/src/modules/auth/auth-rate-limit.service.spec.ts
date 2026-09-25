import { describe, expect, it } from '@jest/globals'
import { HttpException, ServiceUnavailableException } from '@nestjs/common'

import { RedisService } from '../../infrastructure/redis/redis.service'
import { AuthRateLimitService } from './auth-rate-limit.service'

describe('AuthRateLimitService', () => {
  it('limits login attempts by email across different IPs', async () => {
    const counts = new Map<string, number>()
    const redis = {
      connect: async () => ({
        eval: async (_script: string, _keys: number, key: string) => {
          const count = (counts.get(key) ?? 0) + 1
          counts.set(key, count)
          return count
        },
      }),
    } as unknown as RedisService
    const service = new AuthRateLimitService(redis)

    for (let attempt = 0; attempt < 10; attempt++) {
      await service.check('login', { ip: `127.0.0.${attempt + 1}` }, 'ada@example.com')
    }

    await expect(
      service.check('login', { ip: '127.0.0.20' }, 'ada@example.com'),
    ).rejects.toBeInstanceOf(HttpException)
    expect([...counts.keys()].join(' ')).not.toContain('ada@example.com')
  })

  it('fails closed when Redis is unavailable', async () => {
    const redis = {
      connect: async () => {
        throw new Error('Connection refused')
      },
    } as unknown as RedisService
    const service = new AuthRateLimitService(redis)

    await expect(
      service.check('register', { ip: '127.0.0.1' }, 'ada@example.com'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException)
  })
})
