import { ApiProperty } from "@nestjs/swagger"

interface userObject {
    userId: string
    email: string
}


interface backendTokensObject{
    accessToken: string,
    refreshToken: string
}

export class AuthEntity {
    @ApiProperty()
    user: userObject

    @ApiProperty()
    backendTokens: backendTokensObject
}
