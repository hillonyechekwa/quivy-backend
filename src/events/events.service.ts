import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
// import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as QRCode from "qrcode"
import { nanoid } from "nanoid";
import { Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import {Event} from "@prisma/client"
import { ConfigService } from '@nestjs/config';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { PrizesService } from 'src/prizes/prizes.service';





@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
    constructor(
      private prisma: PrismaService,
      private config: ConfigService,
      private fileUpload: FileUploadService,
      private prizes: PrizesService
    ) {}
  // async newEvent(createEventDto: CreateEventDto, userId: string): Promise<Event> {
  //     const uniqueCode = nanoid();
      
  //     // Upload all prize images first, before starting the transaction
  //     const prizeImagesUploaded = await Promise.all(
  //         (createEventDto.prizes || []).map(async (prize) => {
  //             const imageUrl = prize.image ? await this.prizeService.uploadPrizeImage(prize.image) : null;
  //             return {
  //                 ...prize,
  //                 imageUrl
  //             };
  //         })
  //     );

  //   return this.prisma.$transaction(async (tx) => {
  //     const eventData = {
  //       name: createEventDto.name,
  //       description: createEventDto.description,
  //       date: createEventDto.date,
  //       eventStartTime: createEventDto.eventStartTime,
  //       eventEndTime: createEventDto.eventEndTime,
  //       qrCodeValidityDuration: createEventDto.qrCodeValidityDuration,
  //       status: createEventDto.status === "active" ? EventStatus.ACTIVE : createEventDto.status === "upcoming" ? EventStatus.UPCOMING : EventStatus.DRAFTED,
  //       uniqueCode: uniqueCode,
  //       user: {
  //         connect: {
  //           id: userId
  //         }
  //       }
  //     }
      
  //     // Create the event
  //     const newEvent = await tx.event.create({
  //       data: eventData
  //     });
      
  //     // Create prizes with pre-uploaded image URLs
  //     if (prizeImagesUploaded.length > 0) {
  //       for (const prizeData of prizeImagesUploaded) {
  //         await this.prizeService.createPrizeWithTransaction(
  //           tx,
  //           { ...prizeData, imageUrl: prizeData.imageUrl },
  //           newEvent.id
  //         );
  //       }
  //     }
      
  //     // Return the event with prizes loaded
  //     return tx.event.findUnique({
  //       where: { id: newEvent.id },
  //       include: { prizes: true }
  //     })
  //   })
  // }


  async newEvent (createEventDto: CreateEventDto, userId: string): Promise<Event>{
  console.log(createEventDto,'createEventDto')
      const uniqueCode = nanoid(64)

      const newEvent = await this.prisma.event.create({
        data: {
          ...createEventDto,
          status: createEventDto.status === "active" ? "ACTIVE" : 
                  createEventDto.status === "upcoming" ? "UPCOMING" : 
                  "DRAFTED",
          uniqueCode,
          qrCodeUrl: "", // Provide a default value for qrCodeUrl
          user: {
            connect: {
              id: userId
            }
          }
        }
      })
      return newEvent;
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

    async generateQrCode (eventId: string) {
      const event = await this.prisma.event.findUnique({
        where: {
          id: eventId
        }
      })

      this.logger.log(event, "generateQrEvent")

      if(!event) {
        throw new NotFoundException("Event not found")
      }
      

      const baseUrl = this.config.get('BASE_URL')
      
      const qrData = `${baseUrl}/events/scan/${event.uniqueCode}`

      const dataUrl = await QRCode.toDataURL(qrData)
      this.logger.log(dataUrl, "dataUrl")
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')

      const fileName = `qr-${event.uniqueCode}.png`

      const publicUrl = await this.fileUpload.uploadQrCode(buffer, "codes", fileName)

      this.logger.log(publicUrl, "publicUrl")
      if(!publicUrl) {
        throw new InternalServerErrorException("Failed to upload QR code")
      }

      await this.prisma.event.update({
        where: {
          id: event.id
        },
        data: {
          qrCodeUrl: publicUrl
        }
      })

      return publicUrl
    }


    async findByCode (code: string){
      return await this.prisma.event.findUnique({
        where: {
          uniqueCode: code
        }
      })
    }


    async getResults (eventId: string){

      const isWinner =  Math.random() < 0.5

      if(isWinner){
        const prize = await this.prizes.pickRandomPrize(eventId)
        return {
          result: isWinner,
          prizeId: prize.id,
          prize: prize.name
        }
      } else {
        return {
          result: isWinner
        }
      }


    }

    async getEventNotifications(userId: string){
      return await this.prisma.notification.findMany({
        where: {
          userId: userId
        },
        orderBy: {createdAt: 'desc'}
      })
    }
}
