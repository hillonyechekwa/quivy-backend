import { Injectable,Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "src/prisma/prisma.service";
import { PrizeStatus } from "@prisma/client";


@Injectable()
export class PrizeCronService {
    private readonly logger = new Logger(PrizeCronService.name)
    constructor(
        private readonly prisma: PrismaService,
    ){}

    @Cron(CronExpression.EVERY_HOUR)
    async updateAssignedPrizes () {
        this.logger.log("running prize status update cron job...")
        
        const result = await this.prisma.prize.updateMany({
            where: {
                status: PrizeStatus.AVAILABLE,
                quantity: 0
            },
            data: {
                status: PrizeStatus.ASSIGNED
            }
        })

        this.logger.log('Updated ${result.count} prizes to ASSIGNED')
    }

}