import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';



@Injectable()
export class EventsService {
    constructor(
        private prisma: PrismaService
    ) { }
    

    async newEvent(createEventDto: CreateEventDto, userId: string) {
        
    }


    async findAllEventsByUser(userId: string) {
        
    }


    async findOneEvent(eventId: string) {

    }

    async getEventStatus(eventId: string) {
        
    }

    async getActiveQrCode(eventId: string) {
        
    }

}
