import { Exclude } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class UserEntity {
    @ApiProperty()
    id: string

    @ApiProperty()
    email: string
    
    @Exclude()
    password: string

    @ApiProperty({nullable: true})
    hashedRefreshToken: string

    @ApiProperty()
    events: []

    @ApiProperty()
    createdAt: Date

    @ApiProperty()
    updatedAt: Date
}
