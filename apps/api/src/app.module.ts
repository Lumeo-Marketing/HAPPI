import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AppController } from './app.controller'
import {
  configuration,
  environmentFile,
  validateEnvironment,
} from './config/configuration'
import { createTypeOrmOptions } from './database/typeorm.config'
import { RedisModule } from './infrastructure/redis/redis.module'
import { AdminModule } from './modules/admin/admin.module'
import { AuthModule } from './modules/auth/auth.module'
import { AvailabilityModule } from './modules/availability/availability.module'
import { BookingsModule } from './modules/bookings/bookings.module'
import { ClientsModule } from './modules/clients/clients.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { PaymentsModule } from './modules/payments/payments.module'
import { PayoutsModule } from './modules/payouts/payouts.module'
import { SafetyModule } from './modules/safety/safety.module'
import { SessionsModule } from './modules/sessions/sessions.module'
import { TherapistsModule } from './modules/therapists/therapists.module'
import { VerificationModule } from './modules/verification/verification.module'
import { WalletModule } from './modules/wallet/wallet.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: environmentFile,
      load: [configuration],
      validate: validateEnvironment,
    }),
    TypeOrmModule.forRootAsync(createTypeOrmOptions()),
    RedisModule,
    AuthModule,
    ClientsModule,
    TherapistsModule,
    VerificationModule,
    AvailabilityModule,
    BookingsModule,
    PaymentsModule,
    PayoutsModule,
    WalletModule,
    SessionsModule,
    NotificationsModule,
    AdminModule,
    SafetyModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
