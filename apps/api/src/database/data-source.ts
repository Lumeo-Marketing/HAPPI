import 'reflect-metadata'
import 'dotenv/config'
import { ConfigService } from '@nestjs/config'
import { DataSource } from 'typeorm'

import { databaseOptions } from './typeorm.config'

const dataSource = new DataSource({
  ...databaseOptions(new ConfigService(process.env)),
  entities: [`${__dirname}/../modules/**/*.entity{.ts,.js}`],
})

export default dataSource
