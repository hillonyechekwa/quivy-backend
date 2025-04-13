import { IsString, IsDateString, IsPhoneNumber, IsEmail, IsUUID } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"  


export class NewParticipantDto {
    @IsString()
    @ApiProperty({ description: 'ID of the event' })
    eventId: string

    @IsDateString()
    @ApiProperty({ description: 'Date when the participant was selected' })
    selectedAt: Date

    @IsString()
    @ApiProperty({ description: 'Name of the participant' })
    name: string

    @IsEmail()
    @ApiProperty({ description: 'Email of the participant' })
    email: string

    @IsPhoneNumber()
    @ApiProperty({ description: 'Phone number of the participant' })
    phoneNumber: number

    @IsString()
    @ApiProperty({ description: 'Address of the participant' })
    address: string

    @IsUUID()
    @ApiProperty({ description: 'ID of the QR code' })
    qrCodeId: string

    @IsUUID()
    prizeId: string
}