import { IsString, IsNumber, IsEnum, IsOptional } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Express } from "express"
import { PrizeStatus } from "@prisma/client"

export class CreatePrizeDto {
    @IsString()
    @ApiProperty({ description: 'Name of the prize' })
    name: string

    @IsString()
    @ApiProperty({ description: 'Description of the prize' })
    description: string
    
    @IsNumber()
    @ApiProperty({ description: 'Quantity of the prize' })
    quantity: number
    
    @IsEnum(PrizeStatus)
    @ApiProperty({ description: 'status of the prize' })
    status?: PrizeStatus
    
    // @ApiProperty({ description: 'Image File of the prize' })
    // @IsOptional()
    // image?: Express.Multer.File
    
    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'URL of the uploaded image' })
    imageUrl?: string
    
    @IsString()
    @ApiProperty({ description: 'ID of the event' })
    eventId?: string
}