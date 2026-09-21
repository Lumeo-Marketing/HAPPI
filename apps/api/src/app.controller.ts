import { Controller, Get } from '@nestjs/common'

@Controller('health')
export class AppController {
  @Get()
  health() {
    return {
      service: 'happi-api',
      status: 'ok',
      timestamp: new Date().toISOString(),
    }
  }
}
