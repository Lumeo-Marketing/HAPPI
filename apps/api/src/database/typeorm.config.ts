import { ConfigService } from '@nestjs/config'
import type { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm'
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'

export function databaseOptions(
  config: ConfigService,
): PostgresConnectionOptions {
  const url = config.get<string>('DATABASE_URL')
  const useSsl = config.get<string>('DATABASE_SSL') === 'true'
  const shared = {
    type: 'postgres' as const,
    autoLoadEntities: true,
    synchronize: false,
    migrationsRun: false,
    migrations: [`${__dirname}/migrations/*{.ts,.js}`],
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  }

  return url
    ? { ...shared, url }
    : {
        ...shared,
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5432),
        database: config.get<string>('DATABASE_NAME', 'happi_dev'),
        username: config.get<string>('DATABASE_USER', 'postgres'),
        password: config.get<string>('DATABASE_PASSWORD', 'postgres'),
      }
}

export function createTypeOrmOptions(): TypeOrmModuleAsyncOptions {
  return {
    inject: [ConfigService],
    useFactory: (config: ConfigService) => databaseOptions(config),
  }
}
