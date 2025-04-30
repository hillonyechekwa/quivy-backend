import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { PrizesModule } from 'src/prizes/prizes.module';
import { EventCronService } from './jobs/event-cron.service';


@Module({
  imports: [PrismaModule, ConfigModule, FileUploadModule, PrizesModule],
  controllers: [EventsController],
  providers: [EventsService,  EventCronService],
  exports: [EventsService],
})
export class EventsModule {}
