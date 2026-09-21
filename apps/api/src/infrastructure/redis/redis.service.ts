import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common'
import type Redis from 'ioredis'

import { REDIS_CLIENT } from './redis.constants'

@Injectable()
export class RedisService implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CLIENT) readonly client: Redis) {}

  async connect(): Promise<Redis> {
    if (this.client.status === 'wait') {
      await this.client.connect()
    }

    return this.client
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.client.status === 'wait') {
      this.client.disconnect()
      return
    }

    if (this.client.status === 'end') {
      return
    }

    await this.client.quit()
  }
}
