import { IsArray } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { CreatePrizeDto } from "./create-prize.dto"


export class CreatePrizesDto {
    
    @IsArray()
    @ApiProperty()
    prizes: CreatePrizeDto[]
}