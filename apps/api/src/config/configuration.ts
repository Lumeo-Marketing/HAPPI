import { z } from 'zod'

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().optional(),
  API_PORT: z.coerce.number().int().positive().default(4000),
  WEB_URL: z.url().default('http://localhost:3000'),
  ADMIN_URL: z.url().default('http://localhost:5173'),
  DATABASE_HOST: z.string().default('localhost'),
  DATABASE_PORT: z.coerce.number().int().positive().default(5432),
  DATABASE_NAME: z.string().default('happi_dev'),
  DATABASE_USER: z.string().default('postgres'),
  DATABASE_PASSWORD: z.string().default('postgres'),
  DATABASE_URL: z.string().optional(),
  DATABASE_SSL: z.enum(['true', 'false']).default('false'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
})

export type Environment = z.infer<typeof environmentSchema>

export function validateEnvironment(
  environment: Record<string, unknown>,
): Environment {
  return environmentSchema.parse(environment)
}

export function configuration() {
  return {
    app: {
      environment: process.env.NODE_ENV ?? 'development',
    },
  }
}

export const environmentFile = process.env.ENV_FILE ?? '../../.env'
