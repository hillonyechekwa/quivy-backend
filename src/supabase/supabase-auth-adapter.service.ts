import { Injectable } from '@nestjs/common';
import { SupabaseConnectorService } from './supabase-connector.service';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import * as argon2 from 'argon2'


@Injectable()
export class SupabaseAuthAdapter {
    constructor(
        private supabaseConnector: SupabaseConnectorService,
        private auth: AuthService,
        private user: UserService
    ){}


    async handleGoogleCallback(code: string) {
        //get info from supbase
        const supabaseUser = await this.supabaseConnector.exchangeCodeForUserInfo(code)

        //find or create user
        let user = await this.user.findByEmail(supabaseUser.email)

        const newUser: CreateUserDto = {
            email: supabaseUser.email,
            authProvider: 'google'
        }

        if (!user) {
            user = await this.user.createUser(newUser)
        }

        const { accessToken, refreshToken } = await this.auth.generateTokens(user.id, user.email)
        const hashedRefreshToken = await argon2.hash(refreshToken)
        await this.user.updateHashedRefreshToken(user.id, hashedRefreshToken)

        return {            
            user: {
                userId: user.id,
                email: user.email
            },
            backendTokens: {
                accessToken,
                refreshToken
            }
        }
    }
}

