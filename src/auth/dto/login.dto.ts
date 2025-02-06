import { IsString, IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"


export class LoginDto {
    @IsNotEmpty()
    @IsEmail()
    @ApiProperty()
    email: string

    @IsNotEmpty()
    @IsStrongPassword()
    @IsString()
    @ApiProperty()
    password: string
}
