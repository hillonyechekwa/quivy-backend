import { IsString, IsNotEmpty, IsStrongPassword } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"


export class ChangePasswordDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    oldPassword: string

    @IsNotEmpty()
    @IsStrongPassword()
    @IsString()
    @ApiProperty()
    newPassword: string
}