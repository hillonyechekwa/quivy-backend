import { Module } from '@nestjs/common';
import { PrizesService } from './prizes.service';
import { PrizesController } from './prizes.controller';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { PrizeCronService } from './jobs/prize-cron.service';

@Module({
  imports: [FileUploadModule, PrismaModule, ConfigModule],
  controllers: [PrizesController],
  providers: [PrizesService, PrizeCronService],
  exports: [PrizesService],
})
export class PrizesModule {}
