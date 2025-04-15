import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
// import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { nanoid } from "nanoid";
import {Event, EventStatus} from "@prisma/client"
import { PrizeService } from './prize.service';




@Injectable()
export class EventsService {
    constructor(
      private prisma: PrismaService,
      private prizeService: PrizeService
    ) {}

  

  async newEvent(createEventDto: CreateEventDto, userId: string): Promise<Event> {
      const uniqueCode = nanoid();
      
      // Upload all prize images first, before starting the transaction
      const prizeImagesUploaded = await Promise.all(
          (createEventDto.prizes || []).map(async (prize) => {
              const imageUrl = prize.image ? await this.prizeService.uploadPrizeImage(prize.image) : null;
              return {
                  ...prize,
                  imageUrl
              };
          })
      );

    return this.prisma.$transaction(async (tx) => {
      // First, create the event without prizes

      const eventData = {
        name: createEventDto.name,
        description: createEventDto.description,
        date: createEventDto.date,
        eventStartTime: createEventDto.eventStartTime,
        eventEndTime: createEventDto.eventEndTime,
        qrCodeValidityDuration: createEventDto.qrCodeValidityDuration,
        status: createEventDto.status === "active" ? EventStatus.ACTIVE : createEventDto.status === "upcoming" ? EventStatus.UPCOMING : EventStatus.DRAFTED,
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
      
      // Create prizes with pre-uploaded image URLs
      if (prizeImagesUploaded.length > 0) {
        for (const prizeData of prizeImagesUploaded) {
          await this.prizeService.createPrizeWithTransaction(
            tx,
            { ...prizeData, imageUrl: prizeData.imageUrl },
            newEvent.id
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
