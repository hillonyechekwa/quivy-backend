import { Module } from '@nestjs/common';
import { PrizesService } from './prizes.service';
import { PrizesController } from './prizes.controller';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [FileUploadModule, PrismaModule, ConfigModule],
  controllers: [PrizesController],
  providers: [PrizesService],
})
export class PrizesModule {}
