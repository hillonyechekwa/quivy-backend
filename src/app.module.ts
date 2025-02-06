import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { EventsModule } from './events/events.module';
import { MailerModule } from './mailer/mailer.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration'

@Module({
  imports: [UserModule, AuthModule, PrismaModule, EventsModule, MailerModule, ConfigModule.forRoot(configuration)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
