import { IsPhoneNumber, IsString } from 'class-validator'
import { Express } from 'express'
import { ApiProperty } from '@nestjs/swagger'


export class NewProfileDto{
    
    @IsPhoneNumber()
    phoneNumber: number

    @IsString()
    @ApiProperty()
    name: string

    @IsString()
    @ApiProperty()
    address: string

    @ApiProperty()
    profileImage: Express.Multer.File
}