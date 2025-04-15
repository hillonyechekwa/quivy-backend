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

    async pickRandomPrize(eventId: string): Promise<Prize> {
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

    async uploadPrizeImage(file: Express.Multer.File): Promise<string | undefined> {
        if (!file) return undefined;
        const uploadResult = await this.fileUpload.uploadFile(file, "prizes");
        return uploadResult?.url;
    }

    async createPrizeWithTransaction(tx: Prisma.TransactionClient, createPrizeDto: CreatePrizeDto, eventId: string): Promise<Prize> {
        // Use the existing imageUrl from the DTO instead of uploading within transaction
        const newPrize = await tx.prize.create({
            data: {
                name: createPrizeDto.name,
                description: createPrizeDto.description,
                quantity: createPrizeDto.quantity,
                status: createPrizeDto.status,
                imageUrl: createPrizeDto.imageUrl || null, // Use the URL that was uploaded before the transaction
                eventId: eventId,
            }
        })

        return newPrize
    }
}