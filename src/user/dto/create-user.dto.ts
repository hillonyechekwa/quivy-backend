import { IsString, IsEmail, IsNotEmpty, MinLength, IsStrongPassword } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class CreateUserDto {
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty()
    email: string


    @IsNotEmpty()
    @IsStrongPassword()
    @IsString()
    @MinLength(8)
    @ApiProperty()
    password: string
}
