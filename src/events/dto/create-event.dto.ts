import { IsDateString, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateEventDto {
    @IsString()
    name: string

    @IsString()
    @IsOptional()
    description?: string

    date: Date

    time: Date

    @IsDateString()
    eventStartDate: Date

    @IsDateString()
    eventEndDate: Date

    @IsInt()
    @Min(5)
    @Max(1440)
    @IsOptional()
    qrValidityDuration?: number

    Duration: Date

    QrCodeValidityDuration: Date

    maxParticipants: number

}
