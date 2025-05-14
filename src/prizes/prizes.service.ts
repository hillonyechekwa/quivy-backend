import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Prize } from '@prisma/client';
import { FileUploadService } from 'src/file-upload/file-upload.service';
// import { Prisma } from '@prisma/client';
import { CreatePrizesDto } from './dto/create-prizes.dto';


@Injectable()
export class PrizesService {
  constructor(
          private prisma: PrismaService,
          private config: ConfigService,
          private fileUpload: FileUploadService
  ) { }
 
  async getPrizes(eventId: string): Promise<Prize[]>{
    const prizes = await this.prisma.prize.findMany({
      where: {
        eventId
      }
    })

    return prizes
  }

  async createSinglePrize(createPrizeDto: CreatePrizeDto, eventId: string): Promise<Prize> {

          // if (!createPrizeDto.image) return undefined;
  
      const newPrize = await this.prisma.prize.create({
          data: {
              ...createPrizeDto,
              imageUrl: createPrizeDto.imageUrl,
              eventId: eventId,
          }
      })

      return newPrize
  }
  
  async createManyPrizes(createPrizesDto: CreatePrizesDto, eventId): Promise<Prize[]>{
    if (!createPrizesDto.prizes?.length) {
      throw new BadRequestException("No prizes provided")
    }

    const prizes = await Promise.all(createPrizesDto.prizes.map((prize) => {
        return this.createSinglePrize(prize, eventId)
    }))
    
    return prizes
  }
  
  async pickRandomPrize(eventId: string): Promise<Prize> {
    const prizes = await this.prisma.prize.findMany({
        where: {
            eventId: eventId,
            status: "AVAILABLE",
            AND: [
                { quantity: { gt: 0 } }
            ]
        }
    })

    if(prizes.length === 0) {
        throw new Error("No active prizes found")
    }

    const randomIndex = Math.floor(Math.random() * prizes.length)
    const randomPrize = prizes[randomIndex]
    //update prize quantity
    await this.prisma.prize.update({
      where: {
        id: randomPrize.id
      },
      data: {
        quantity: {
          decrement: 1
        }
      }
    })
    //check if prize quantity is now 0
    return prizes[randomIndex]
  }
  
  async uploadPrizeImage(file: Express.Multer.File): Promise<string | undefined> {
      if (!file) return undefined;
      const uploadResult = await this.fileUpload.uploadFileToSupabase(file, "prizes");
      return uploadResult?.url;
    }

  async makePrizeUnavailable(prizeId: string): Promise<Prize> {
    const prize = await this.prisma.prize.findUnique({
      where: {
          id: prizeId
      },
      select: {
        quantity: true
      }
    })

    if (prize.quantity === 0) {
      return await this.prisma.prize.update({
          where: {
              id: prizeId
          },
          data: {
            status: "ASSIGNED"
          }
        })
    }
  }

  
      // async createPrizeWithTransaction(tx: Prisma.TransactionClient, createPrizeDto: CreatePrizeDto, eventId: string): Promise<Prize> {
      //     // Use the existing imageUrl from the DTO instead of uploading within transaction
  
      //     console.log('prizedto', createPrizeDto)
  
      //     const prizeImageUrl  = await this.uploadPrizeImage(createPrizeDto.image)
  
      //     const newPrize = await tx.prize.create({
      //         data: {
      //             name: createPrizeDto.name,
      //             description: createPrizeDto.description,
      //             quantity: createPrizeDto.quantity,
      //             status: createPrizeDto.status,
      //             imageUrl: prizeImageUrl,// Use the URL that was uploaded before the transaction
      //             eventId: eventId,
      //         }
      //     })
      //     console.log('newPrize', newPrize)
      //     return newPrize
      // }
}
