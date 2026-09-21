import 'reflect-metadata'
import { ConfigService } from '@nestjs/config'
import dotenv from 'dotenv'
import { DataSource } from 'typeorm'

import { environmentFile } from '../config/configuration'
import { databaseOptions } from './typeorm.config'

dotenv.config({ path: environmentFile })

const dataSource = new DataSource({
  ...databaseOptions(new ConfigService(process.env)),
  entities: [`${__dirname}/../modules/**/*.entity{.ts,.js}`],
})

export default dataSource
