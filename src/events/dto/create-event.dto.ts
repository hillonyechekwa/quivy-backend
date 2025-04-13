import { IsDateString, IsArray, IsInt, IsOptional, IsString, IsEnum, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { EventStatus} from "@prisma/client";
import { CreatePrizeDto as Prize } from "./create-prize.dto"; // Adjust the import path as necessary

export class CreateEventDto {
    @IsString()
    @ApiProperty({ description: 'Name of the event' })
    name: string;

    @IsString()
    @ApiProperty({ description: 'Description of the event' })
    description: string;

    @IsDateString()
    @ApiProperty({ description: 'Date of the event' })
    date: Date;

    @IsDateString()
    @ApiProperty({ description: 'Start time of the event' })
    eventStartTime: Date;

    @IsDateString()
    @ApiProperty({ description: 'End time of the event' })
    eventEndTime: Date;

    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'Duration in minutes for which QR code remains valid' })
    qrCodeValidityDuration: number;

    @IsEnum(EventStatus)
    @IsOptional()
    @ApiProperty({ 
    enum: EventStatus, 
    default: EventStatus.DRAFTED,
    description: 'Status of the event'
    })
    status?: EventStatus;

    @IsArray()
    @ApiProperty()
    prizes: Prize[]; 

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'Unique code for the event, will be auto-generated if not provided' })
    uniqueCode?: string;
}