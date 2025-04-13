import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NewParticipantDto } from './dto/new-participant.dto';
import { Winner } from '@prisma/client';



@Injectable()
export class ParticipantsService {
    constructor(
        private prisma: PrismaService
    ) { }

    async newParticipant(newParticipantDto: NewParticipantDto, eventId: string): Promise<Winner> {
        const newParticipant = await this.prisma.winner.create({
            data: {
                ...newParticipantDto,
                eventId: eventId,
            }
        })

        return newParticipant
    }
}
