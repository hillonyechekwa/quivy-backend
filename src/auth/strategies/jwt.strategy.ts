import { Injectable, Inject } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy, ExtractJwt } from "passport-jwt"
import { ConfigType } from "@nestjs/config"
import jwtConfig from "src/config/jwt.config"
import { PayloadType } from "src/types/payload"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject(jwtConfig.KEY)
        private jwtConfiguration: ConfigType<typeof jwtConfig>
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConfiguration.secret
        })
    }

    validate(payload: PayloadType) {
        return {
            email: payload.email,
            userId: payload.userId
        }
    }
}