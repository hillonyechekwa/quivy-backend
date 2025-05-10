import { ApiProperty } from "@nestjs/swagger"

interface userObject {
    userId: string
    email: string
    accountStatus: string
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
