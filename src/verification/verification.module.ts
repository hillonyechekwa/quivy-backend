import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { PrismaModule } from 'src/prisma/prisma.module';


@Module({
  imports: [PrismaModule],
  providers: [VerificationService],
  exports: [VerificationService]
})
export class VerificationModule {}
