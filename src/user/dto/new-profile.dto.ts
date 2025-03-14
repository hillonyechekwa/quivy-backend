import {IsPhoneNumber, IsString} from 'class-validator'
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
}