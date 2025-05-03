import { Module } from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { ParticipantsController } from './participants.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { VerificationModule } from 'src/verification/verification.module';
import { MailerModule } from 'src/mailer/mailer.module';

@Module({
  imports: [PrismaModule, VerificationModule, MailerModule],
  controllers: [ParticipantsController],
  providers: [ParticipantsService],
})
export class ParticipantsModule {}
