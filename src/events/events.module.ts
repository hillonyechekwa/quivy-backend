import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { QrCodeService } from './qrcode.service';
import { PrizeService } from './prize.service';
import { FileUpload } from 'src/user/fileUpload.service';


@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [EventsController],
  providers: [EventsService, QrCodeService, PrizeService, FileUpload],
  exports: [QrCodeService, PrizeService],
})
export class EventsModule {}
