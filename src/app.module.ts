import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import {APP_GUARD} from "@nestjs/core";
import {JwtAuthGuard} from "./guards/jwt.guard";
import {AccountGuard} from "./guards/account.guard";
import { PrismaModule } from './prisma/prisma.module';
import { EventsModule } from './events/events.module';
import { MailerModule } from './mailer/mailer.module';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { VerificationModule } from './verification/verification.module';
import { ParticipantsModule } from './participants/participants.module';
import configuration from './config/configuration'

@Module({
  imports: [UserModule,
    AuthModule,
    PrismaModule,
    EventsModule,
    MailerModule,
    ConfigModule.forRoot(configuration),
    SupabaseModule,
    VerificationModule,
    ParticipantsModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: AccountGuard  
    }
  ],
})
export class AppModule {}
