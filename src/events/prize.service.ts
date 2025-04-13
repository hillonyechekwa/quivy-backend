import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { Prisma, Prize } from "@prisma/client";
import { CreatePrizeDto } from "./dto/create-prize.dto";
import { FileUpload } from "src/user/fileUpload.service";



@Injectable()
export class PrizeService {
    
    constructor(
        private prisma: PrismaService,
        private config: ConfigService,
        private fileUpload: FileUpload
    ) {}
    
    async createPrize(createPrizeDto: CreatePrizeDto, eventId: string): Promise<Prize> {
        const prizeUrl = await this.fileUpload.uploadFile(createPrizeDto.image, "prizes")

        const newPrize = await this.prisma.prize.create({
            data: {
                ...createPrizeDto,
                imageUrl: prizeUrl?.url,
                eventId: eventId,
            }
        })

        return newPrize
    }

    async pickRandomPrize(eventId: string): Promise<Prize>{
        const prizes = await this.prisma.prize.findMany({
            where: {
                eventId: eventId,
                status: "AVAILABLE"
            }
        })

        if(prizes.length === 0) {
            throw new Error("No active prizes found")
        }

        const randomIndex = Math.floor(Math.random() * prizes.length)
        return prizes[randomIndex]
    }


    async createPrizeWithTransaction(tx: Prisma.TransactionClient, createPrizeDto: CreatePrizeDto, eventId: string): Promise<Prize> {
        const prizeImageUrl = await this.fileUpload.uploadFile(createPrizeDto.image, "prizes")
        const newPrize = await tx.prize.create({
            data: {
                ...createPrizeDto,
                imageUrl: prizeImageUrl?.url,
                eventId: eventId,
            }
        })

        return newPrize
    }
}