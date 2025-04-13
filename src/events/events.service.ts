import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
// import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { nanoid } from "nanoid";
import {Event} from "@prisma/client"
import { PrizeService } from './prize.service';




@Injectable()
export class EventsService {
    constructor(
      private prisma: PrismaService,
      private prizeService: PrizeService
    ) {}

  

  async newEvent(createEventDto: CreateEventDto, userId: string): Promise<Event> {
      const uniqueCode = nanoid();
      

    return this.prisma.$transaction(async (tx) => {
      // First, create the event without prizes

      const eventData = {
        name: createEventDto.name,
        description: createEventDto.description,
        date: createEventDto.date,
        eventStartTime: createEventDto.eventStartTime,
        eventEndTime: createEventDto.eventEndTime,
        qrCodeValidityDuration: createEventDto.qrCodeValidityDuration,
        status: createEventDto.status || 'DRAFTED',
        uniqueCode: uniqueCode,
        user: {
          connect: {
            id: userId
          }
        }
      }
      
      const newEvent = await tx.event.create({
        data: {
          ...eventData
        }
      });
      
      // If there are prizes, create them using the prize service
      if (createEventDto.prizes && createEventDto.prizes.length > 0) {
        for (const prizeData of createEventDto.prizes) {
          // Use your prize service to create each prize
          // This will handle image uploads properly
          await this.prizeService.createPrizeWithTransaction(
            tx,
            prizeData,
            newEvent.id // Link to the newly created event
          );
        }
      }
      
      // Return the event with prizes loaded
      return tx.event.findUnique({
        where: { id: newEvent.id },
        include: { prizes: true }
      })
    })
  }


    async findAllEventsByUser(userId: string): Promise<Event[]> {
        return await this.prisma.event.findMany({
          where: {
            userId: userId
          }
        })
    }


    async findOneEventByUser(eventId: string, userId: string): Promise<Event> {
        return await this.prisma.event.findUnique({
          where: {
            id: eventId,
            userId: userId
      }
    })
    }

    async getEventStatus(eventId: string) {
       return await this.prisma.event.findUnique({
        where: {
          id: eventId
        },
        select: {
          status: true
        }
      }) 
    }

    async getActiveQrCode(eventId: string) {
       return await this.prisma.event.findUnique({
          where: {
            id: eventId
          },
          select: {
            activeQrCode: true
          }
      }) 
    }

}
