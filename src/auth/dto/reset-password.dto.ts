import { IsString, IsNotEmpty } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"


export class ResetPassswordDto {
    @IsString()
    @IsNotEmpty()
    token: string

    @IsString()
    @IsNotEmpty()
    newPassword: string
}