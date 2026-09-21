import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)

  app.setGlobalPrefix('api/v1')
  app.enableCors({
    credentials: true,
    origin: [
      config.getOrThrow<string>('WEB_URL'),
      config.getOrThrow<string>('ADMIN_URL'),
    ],
  })
  app.enableShutdownHooks()

  await app.listen(config.getOrThrow<number>('API_PORT'))
}

void bootstrap()
