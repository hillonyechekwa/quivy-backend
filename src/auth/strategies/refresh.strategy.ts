import { Injectable, Inject } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy, ExtractJwt } from "passport-jwt"
import { Request } from "express"
import { ConfigType } from "@nestjs/config"
import refreshConfig from "src/config/refresh.config"
import { PayloadType } from "src/types/payload"
import { AuthService } from "../auth.service"


@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject(refreshConfig.KEY)
        private refreshConfiguration: ConfigType<typeof refreshConfig>,
        private authService: AuthService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: refreshConfiguration.secret,
            passReqToCallback: true
        })
    }

    validate(req: Request, payload: PayloadType) {
        const refreshToken = req.get("authorization").replace('Bearer', "").trim()
        const userId = payload.userId
        return this.authService.validateRefreshToken(userId, refreshToken)
    }
}