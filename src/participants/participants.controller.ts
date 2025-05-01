import { Body, Controller, Param, Post } from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { NewParticipantDto } from './dto/new-participant.dto';
import { ApiTags } from '@nestjs/swagger';
import { VerificationService } from 'src/verification/verification.service';
import { MailerService } from 'src/mailer/mailer.service';
import { Public } from 'src/decorators/public.decorator';


@Controller('participants')
@ApiTags('Participants')
export class ParticipantsController {
  constructor(
    private readonly participantsService: ParticipantsService,
    private readonly verification: VerificationService,
    private readonly mailer: MailerService
  ) {}

  @Public()
  @Post('create/:eventId')
  async createParticipant(@Param("eventId") eventId: string, @Body() createParticipant: NewParticipantDto): Promise<string> {
    const winner = await this.participantsService.newParticipant(createParticipant, eventId)
    const redeemCode = await this.verification.generateWinnerRedeemCode(winner.id)
    
    await this.mailer.sendMail({
      subject: `Quivy - Prize Redeeming Code`,
      sender: `Quivy <onboarding@resend.dev>`,
      recipients: [winner.email],
      html: `<p>Hi${winner.email.split('@')[0]},</p><p>You won a prize. Use this code to redeem your prize<br /><span style="font-size:24px; font-weight: 700;">${redeemCode}</span></p><p>Regards,<br />Quivy</p>`
    }) 
    return redeemCode 
  }
}
