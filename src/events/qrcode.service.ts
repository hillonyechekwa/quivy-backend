import { Injectable } from "@nestjs/common";
import * as QRCode from 'qrcode'
import { Cron, CronExpression } from "@nestjs/schedule";
import { nanoid } from "nanoid";
import { PrismaService } from "src/prisma/prisma.service";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class QrCodeService {
    constructor(
        private prisma: PrismaService,
        private config: ConfigService
    ) { }
    

    async generateQrCode(eventId: string) {
        const event = await this.prisma.event.findUnique({
            where: {
                id: eventId
            },
            include:{
                activeQrCode: true
            }
        })

        if (!event) {
            throw new Event("Event not found")
        }

        //checks if event is active
        const now = new Date()
        if(now < event.eventStartDate || now > event.eventEndDate) {
            throw new Error('Cannont generate QR code - event is not active')
        }

        const expiresAt = new Date()
        expiresAt.setMinutes(expiresAt.getMinutes() + event.QrCodeValidityDuration)


        const uniqueCode = nanoid()

        const result = await this.prisma.$transaction(async (tx) => {
            //if there's  an active qrcode, deactivate it
            if (event.activeQrCode) {
                await tx.qrCode.update({
                    where: {
                        id: event.activeQrCode.id
                    },
                    data: {
                        isActive: false
                    }
                })
            }

            //create new QR Code
            const newQrCode = await tx.qrCode.create({
                data: {
                    code: uniqueCode,
                    expiresAt,
                    event: {
                        connect: {
                            id: eventId
                        }
                    }
                }
            })

        return newQrCode   
        })


        //generate qrcode url
        //TODO; remember to update this in the .env
        const entryUrl = `${this.config.get<string>('FRONTEND_URL')}/entry/${event.uniqueCode}/${result.code}`
        const qrCodeDataUrl = await QRCode.toDataUrl(entryUrl)

        return {
            qrCodeDataUrl,
            expiresAt: result.expiresAt
        }
    }


    async verifyQRCode(eventUniqueCode: string, qrCodeUniqueCode: string) {
        const now = new Date()

        const event = await this.prisma.event.findUnique({
            where: {
                uniqueCode: eventUniqueCode
            }
        })

        if (!event) {
            return {
                valid: false,
                reason: "event not found"
            }
        }

        if (now < event.eventStartDate || now > event.eventEndDate) {
            return {
                valid: false,
                reason: "event not active"
            }
        }


        //find the qr code
        const qrCode = await this.prisma.qrCode.findUnique({
            where: {
                code: qrCodeUniqueCode,
                eventId: event.id
            }
        })

        if (!qrCode) {
            return {
                valid: false,
                reason: "Invalid QR code"
            }
        }

        if (now > qrCode.expiresAt || !qrCode.isActive) {
            return {
                valid: false,
                reason: "QR Code has expired"
            }
        }

        return {
            valid: true,
            eventId: event.id,
            qrCodeId: qrCode.id        
        }

    }


    //cron job to expire old qrcodes
    @Cron(CronExpression.EVERY_MINUTE)
    async handleExpiredQrCodes() {
        const now = new Date()
        
        const expiredCodes = await this.prisma.qrCode.findMany({
            where: {
                expiresAt: { lt: now },
                isActive: true
            }
        })

        if (expiredCodes.length > 0) {
            await this.prisma.qrCode.updateMany({
                where: {
                    id: {
                        in: expiredCodes.map(code => code.id)
                    }
                },
                data: {
                    isActive: false
                }
            })
        }


        for (const code of expiredCodes) {
            if (code.eventId) {
                await this.prisma.event.update({
                    where: {
                        id: code.eventId
                    },
                    data: {
                        activeQrCode:{
                            disconnect: true
                        }
                    }
                })
            }
        }
    }
}