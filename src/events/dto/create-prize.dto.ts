import { IsString, IsNumber, IsEnum } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Express } from "express"
import { PrizeStatus } from "@prisma/client"


export class CreatePrizeDto {

    @IsString()
    @ApiProperty({ description: 'ID of the prize' })
    name: string

    @IsString()
    @ApiProperty({ description: 'Description of the prize' })
    description: string


    @ApiProperty({ description: 'Image File of the prize' })
    image: Express.Multer.File

    @IsNumber()
    @ApiProperty({ description: 'Quantity of the prize' })
    quantity: number

    @IsEnum(PrizeStatus)
    @ApiProperty({ description: 'status of the prize' })
    status: PrizeStatus

    @IsString()
    @ApiProperty({ description: 'ID of the event' })
    eventId: string
}  