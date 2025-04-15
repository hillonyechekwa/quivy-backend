import { Body, Controller, Param, Post } from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Winner } from '@prisma/client';


@Controller('participants')
@ApiTags('Participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  
  @Post('create/:eventId')
  async createParticipant(@Param("eventId") eventId: string, @Body() createParticipant): Promise<Winner> {
    return await this.participantsService.newParticipant(createParticipant, eventId)
  }
}
